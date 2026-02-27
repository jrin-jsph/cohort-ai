import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";
import multer from "multer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const db = new Database("smartgroup.db");
db.pragma('foreign_keys = ON');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL -- 'faculty', 'student'
  );

  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cgpa REAL NOT NULL,
    skills TEXT, -- JSON array of skills
    gender TEXT,
    email TEXT UNIQUE,
    class_id INTEGER,
    FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    class_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER,
    student_id INTEGER,
    role TEXT,
    FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'avoid_pair', 'gender_balance', etc.
    student1_id INTEGER,
    student2_id INTEGER,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    sender_id INTEGER NOT NULL,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER,
    title TEXT NOT NULL,
    question_count INTEGER,
    file_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER,
    group_id INTEGER,
    file_name TEXT,
    marks REAL,
    comments TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS faculty_profiles (
    user_id INTEGER PRIMARY KEY,
    name TEXT,
    department TEXT,
    designation TEXT,
    bio TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Migrations for existing databases
try {
  db.prepare("ALTER TABLE students ADD COLUMN class_id INTEGER").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE groups ADD COLUMN class_id INTEGER").run();
} catch (e) {}

// Initialize Faculty User if not exists
const facultyExists = db.prepare("SELECT * FROM users WHERE role = 'faculty'").get();
if (!facultyExists) {
  db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run("admin@smartgroup.ai", "admin123", "faculty");
}

// Initialize Demo Student if not exists
const studentExists = db.prepare("SELECT * FROM users WHERE email = ?").get("alice@example.edu");
if (!studentExists) {
  db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run("alice@example.edu", "student123", "student");
  db.prepare("INSERT INTO students (name, cgpa, skills, gender, email) VALUES (?, ?, ?, ?, ?)").run(
    "Alice Johnson", 
    3.8, 
    JSON.stringify(["Coding", "UI/UX"]), 
    "Female", 
    "alice@example.edu"
  );
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  app.use(express.json());
  const PORT = 3000;

  // --- Auth Routes ---
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    
    if (user) {
      let classId = null;
      let name = 'Student';
      if (user.role === 'student') {
        const student = db.prepare("SELECT name, class_id FROM students WHERE email = ?").get(email) as any;
        name = student?.name || 'Student';
        classId = student?.class_id;
      } else {
        name = 'Faculty Admin';
      }

      res.json({ 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name,
        class_id: classId
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // --- API Routes ---

  // Classes
  app.get("/api/classes", (req, res) => {
    const classes = db.prepare("SELECT * FROM classes").all();
    res.json(classes);
  });

  app.post("/api/classes", (req, res) => {
    const { name } = req.body;
    const info = db.prepare("INSERT INTO classes (name) VALUES (?)").run(name);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/classes/:id", (req, res) => {
    db.prepare("DELETE FROM classes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Students
  app.get("/api/students", (req, res) => {
    const classId = req.query.classId;
    let students;
    if (classId) {
      students = db.prepare("SELECT * FROM students WHERE class_id = ?").all(classId);
    } else {
      students = db.prepare("SELECT * FROM students").all();
    }
    res.json(students.map(s => ({ ...s, skills: JSON.parse(s.skills || "[]") })));
  });

  app.post("/api/students", (req, res) => {
    const { name, cgpa, skills, gender, email, class_id } = req.body;
    try {
      const insertUser = db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)");
      const insertStudent = db.prepare(
        "INSERT INTO students (name, cgpa, skills, gender, email, class_id) VALUES (?, ?, ?, ?, ?, ?)"
      );
      
      const transaction = db.transaction(() => {
        insertUser.run(email, "student123", "student");
        const info = insertStudent.run(name, cgpa, JSON.stringify(skills), gender, email, class_id);
        return info.lastInsertRowid;
      });
      
      const id = transaction();
      res.json({ id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/students/bulk", (req, res) => {
    const { students, class_id } = req.body; // Object with students array and class_id
    const insertUser = db.prepare("INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)");
    const insertStudent = db.prepare(
      "INSERT OR REPLACE INTO students (name, cgpa, skills, gender, email, class_id) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const insertMany = db.transaction((data) => {
      for (const s of data) {
        insertUser.run(s.email, "student123", "student");
        insertStudent.run(s.name, s.cgpa, JSON.stringify(s.skills), s.gender, s.email, class_id);
      }
    });
    insertMany(students);
    res.json({ success: true });
  });

  app.delete("/api/students/:id", (req, res) => {
    try {
      // Manually delete from group_members first to be safe if CASCADE isn't active on existing table
      db.prepare("DELETE FROM group_members WHERE student_id = ?").run(req.params.id);
      db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Constraints
  app.get("/api/constraints", (req, res) => {
    const constraints = db.prepare("SELECT * FROM constraints").all();
    res.json(constraints);
  });

  app.post("/api/constraints", (req, res) => {
    const { type, student1_id, student2_id, value } = req.body;
    const info = db.prepare(
      "INSERT INTO constraints (type, student1_id, student2_id, value) VALUES (?, ?, ?, ?)"
    ).run(type, student1_id, student2_id, value);
    res.json({ id: info.lastInsertRowid });
  });

  // Group Generation Logic
  app.post("/api/groups/generate", (req, res) => {
    const { groupSize, namePrefix = "Group", classId } = req.body;
    
    if (!classId) {
      return res.status(400).json({ error: "Class ID is required" });
    }

    const students = db.prepare("SELECT * FROM students WHERE class_id = ?").all(classId).map(s => ({
      ...s,
      skills: JSON.parse(s.skills || "[]")
    }));

    if (students.length === 0) {
      return res.status(400).json({ error: "No students found in this class" });
    }

    // 1. Sort by CGPA for academic balance
    students.sort((a, b) => b.cgpa - a.cgpa);

    const numGroups = Math.ceil(students.length / groupSize);
    const groups: any[][] = Array.from({ length: numGroups }, () => []);

    // 2. Round-robin distribution (Snake pattern for better balance)
    students.forEach((student, index) => {
      const row = Math.floor(index / numGroups);
      const col = index % numGroups;
      const targetGroup = row % 2 === 0 ? col : numGroups - 1 - col;
      
      if (groups[targetGroup]) {
        groups[targetGroup].push(student);
      } else {
        groups[index % numGroups].push(student);
      }
    });

    // 3. Save to DB
    const deleteOld = db.transaction(() => {
      db.prepare("DELETE FROM group_members WHERE group_id IN (SELECT id FROM groups WHERE class_id = ?)").run(classId);
      db.prepare("DELETE FROM groups WHERE class_id = ?").run(classId);
    });
    deleteOld();

    const insertGroup = db.prepare("INSERT INTO groups (name, class_id) VALUES (?, ?)");
    const insertMember = db.prepare("INSERT INTO group_members (group_id, student_id, role) VALUES (?, ?, ?)");

    const roles = ["Team Leader", "Developer", "Documentation Lead", "Presenter"];

    const result = groups.map((groupStudents, i) => {
      const groupName = `${namePrefix} ${i + 1}`;
      const info = insertGroup.run(groupName, classId);
      const groupId = info.lastInsertRowid;

      groupStudents.forEach((student, sIndex) => {
        const role = roles[sIndex] || "Member";
        insertMember.run(groupId, student.id, role);
      });

      return {
        id: groupId,
        name: groupName,
        class_id: classId,
        members: groupStudents.map((s, idx) => ({ ...s, role: roles[idx] || "Member" }))
      };
    });

    res.json(result);
  });

  app.get("/api/groups", (req, res) => {
    const classId = req.query.classId;
    let groups;
    if (classId) {
      groups = db.prepare("SELECT * FROM groups WHERE class_id = ?").all(classId);
    } else {
      groups = db.prepare("SELECT * FROM groups").all();
    }
    
    const result = groups.map(g => {
      const members = db.prepare(`
        SELECT s.*, gm.role 
        FROM students s 
        JOIN group_members gm ON s.id = gm.student_id 
        WHERE gm.group_id = ?
      `).all(g.id);
      return {
        ...g,
        members: members.map((m: any) => ({ ...m, skills: JSON.parse(m.skills || "[]") }))
      };
    });
    res.json(result);
  });

  app.get("/api/messages/:roomId", (req, res) => {
    const messages = db.prepare("SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp ASC").all(req.params.roomId);
    res.json(messages);
  });

  // Tests
  app.get("/api/tests", (req, res) => {
    const classId = req.query.classId;
    if (!classId) return res.status(400).json({ error: "Class ID required" });
    const tests = db.prepare("SELECT * FROM tests WHERE class_id = ? ORDER BY created_at DESC").all(classId);
    res.json(tests);
  });

  app.post("/api/tests", upload.single("file"), (req, res) => {
    const { class_id, title, question_count } = req.body;
    const fileName = req.file ? req.file.filename : null;
    const info = db.prepare(
      "INSERT INTO tests (class_id, title, question_count, file_name) VALUES (?, ?, ?, ?)"
    ).run(class_id, title, question_count, fileName);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/tests/:id", (req, res) => {
    db.prepare("DELETE FROM tests WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Submissions
  app.get("/api/submissions", (req, res) => {
    const testId = req.query.testId;
    if (!testId) return res.status(400).json({ error: "Test ID required" });
    const submissions = db.prepare(`
      SELECT s.*, g.name as group_name 
      FROM submissions s 
      JOIN groups g ON s.group_id = g.id 
      WHERE s.test_id = ?
    `).all(testId);
    res.json(submissions);
  });

  app.post("/api/submissions", upload.single("file"), (req, res) => {
    const { test_id, group_id } = req.body;
    const fileName = req.file ? req.file.filename : null;
    const info = db.prepare(
      "INSERT INTO submissions (test_id, group_id, file_name) VALUES (?, ?, ?)"
    ).run(test_id, group_id, fileName);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/submissions/:id", (req, res) => {
    const { marks, comments } = req.body;
    db.prepare(
      "UPDATE submissions SET marks = ?, comments = ? WHERE id = ?"
    ).run(marks, comments, req.params.id);
    res.json({ success: true });
  });

  // Faculty Profile
  app.get("/api/faculty/profile/:userId", (req, res) => {
    const profile = db.prepare("SELECT * FROM faculty_profiles WHERE user_id = ?").get(req.params.userId);
    res.json(profile || {});
  });

  app.post("/api/faculty/profile", (req, res) => {
    const { user_id, name, department, designation, bio } = req.body;
    const exists = db.prepare("SELECT user_id FROM faculty_profiles WHERE user_id = ?").get(user_id);
    if (exists) {
      db.prepare(
        "UPDATE faculty_profiles SET name = ?, department = ?, designation = ?, bio = ? WHERE user_id = ?"
      ).run(name, department, designation, bio, user_id);
    } else {
      db.prepare(
        "INSERT INTO faculty_profiles (user_id, name, department, designation, bio) VALUES (?, ?, ?, ?, ?)"
      ).run(user_id, name, department, designation, bio);
    }
    res.json({ success: true });
  });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    socket.on("send_message", (data) => {
      const { room_id, sender_id, sender_name, content } = data;
      const info = db.prepare(
        "INSERT INTO messages (room_id, sender_id, sender_name, content) VALUES (?, ?, ?, ?)"
      ).run(room_id, sender_id, sender_name, content);
      
      const newMessage = {
        id: info.lastInsertRowid,
        room_id,
        sender_id,
        sender_name,
        content,
        timestamp: new Date().toISOString()
      };

      io.to(room_id).emit("receive_message", newMessage);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
