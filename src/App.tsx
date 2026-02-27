import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  UserPlus,
  Settings,
  LayoutGrid,
  PieChart,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  BrainCircuit,
  GraduationCap,
  Code2,
  FileText,
  Presentation,
  User,
  MessageSquare,
  Send,
  Hash,
  AtSign,
  Search,
  Menu,
  X,
  UploadCloud,
  BookOpen,
  PlusCircle,
  ClipboardList,
  UserCircle,
  FileUp,
  MessageSquarePlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { Student, Group, User as UserType, Class } from './types';
import { getGroupInsights } from './services/geminiService';

interface Message {
  id: number;
  room_id: string;
  sender_id: number;
  sender_name: string;
  content: string;
  timestamp: string;
}

const ChatRoom: React.FC<{ user: UserType, roomId: string, title: string, subtitle: string }> = ({ user, roomId, title, subtitle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io();

    fetch(`/api/messages/${roomId}`)
      .then(res => res.json())
      .then(data => setMessages(data));

    socketRef.current.emit('join_room', roomId);

    socketRef.current.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socketRef.current?.emit('send_message', {
      room_id: roomId,
      sender_id: user.id,
      sender_name: user.name,
      content: newMessage
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-zinc-900">{title}</h3>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender_id === user.id ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.sender_id === user.id
                ? 'bg-zinc-900 text-white rounded-tr-none'
                : 'bg-zinc-100 text-zinc-900 rounded-tl-none'
              }`}>
              <p className="font-bold text-[10px] mb-1 opacity-50">{msg.sender_name}</p>
              <p>{msg.content}</p>
            </div>
            <span className="text-[9px] text-zinc-400 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-zinc-900/5 transition-all"
        />
        <button
          type="submit"
          className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

const Login: React.FC<{ onLogin: (user: UserType) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async (role: 'faculty' | 'student') => {
    setLoading(true);
    setError('');
    const credentials = role === 'faculty'
      ? { email: 'admin@smartgroup.ai', password: 'admin123' }
      : { email: 'alice@example.edu', password: 'student123' };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">SmartGroup AI</h1>
          </div>

          <h2 className="text-xl font-bold mb-2">Welcome back</h2>
          <p className="text-zinc-500 text-sm mb-8">Choose your portal or sign in manually.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleQuickLogin('faculty')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all group"
            >
              <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold">Faculty Portal</span>
            </button>
            <button
              onClick={() => handleQuickLogin('student')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all group"
            >
              <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <User className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold">Student Portal</span>
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-400 bg-white px-2">Or manual sign in</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-zinc-900/5 transition-all"
                placeholder="admin@smartgroup.ai"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-zinc-900/5 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-600 text-xs font-medium bg-rose-50 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const StudentDashboard: React.FC<{ user: UserType, groups: Group[] }> = ({ user, groups }) => {
  const [activeSubTab, setActiveSubTab] = useState<'my-team' | 'all-groups' | 'mentor-chat' | 'team-chat' | 'settings'>('my-team');
  const myGroup = groups.find(g => g.members.some(m => m.email === user.email));
  const myInfo = myGroup?.members.find(m => m.email === user.email);

  // Calculate team skill distribution
  const allSkills = myGroup?.members.flatMap(m => m.skills) || [];
  const skillCounts = allSkills.reduce((acc: any, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {});

  const radarData = Object.keys(skillCounts).map(skill => ({
    subject: skill,
    A: skillCounts[skill],
    fullMark: myGroup?.members.length || 4
  })).slice(0, 6);

  const avgCgpa = myGroup
    ? (myGroup.members.reduce((acc, m) => acc + m.cgpa, 0) / myGroup.members.length).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold">Student Dashboard</h2>
          <p className="text-zinc-500">Welcome back, {user.name}. Here is your portal.</p>
        </div>

        <nav className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full overflow-x-auto no-scrollbar">
          {[
            { id: 'my-team', icon: Users, label: 'My Team' },
            { id: 'all-groups', icon: LayoutGrid, label: 'All Groups' },
            { id: 'mentor-chat', icon: MessageSquare, label: 'Mentor' },
            { id: 'team-chat', icon: Hash, label: 'Team Chat' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${activeSubTab === tab.id
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
                }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'my-team' && (
          <motion.div
            key="my-team"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {myGroup ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Team Profile */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-serif font-bold">{myGroup.name}</h3>
                        <p className="text-zinc-500 text-sm">Official Project Team Assignment</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-zinc-400">Team Avg CGPA</p>
                        <p className="text-2xl font-serif font-bold text-zinc-900">{avgCgpa}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {myGroup.members.map(member => (
                        <motion.div
                          key={member.id}
                          whileHover={{ y: -2 }}
                          className={`p-5 rounded-2xl border transition-all ${member.email === user.email
                              ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-200'
                              : 'bg-zinc-50 border-zinc-100 hover:border-zinc-200'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${member.email === user.email ? 'bg-white/20' : 'bg-white shadow-sm text-zinc-500'
                              }`}>
                              <User className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${member.email === user.email ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'
                              }`}>
                              {member.cgpa.toFixed(1)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{member.name} {member.email === user.email && '(You)'}</h4>
                            <p className={`text-[10px] font-medium mb-3 ${member.email === user.email ? 'text-zinc-400' : 'text-zinc-500'}`}>
                              {member.role}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {member.skills.map((s, i) => (
                                <span key={i} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${member.email === user.email ? 'bg-white/10 text-white/80' : 'bg-white border border-zinc-200 text-zinc-500'
                                  }`}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Team Strengths */}
                  <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                    <h3 className="font-serif text-xl font-bold mb-6">Team Skill Composition</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#f0f0f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#888' }} />
                            <Radar name="Team Skills" dataKey="A" stroke="#18181b" fill="#18181b" fillOpacity={0.1} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-4">
                        <p className="text-sm text-zinc-600 leading-relaxed">
                          Your team has a diverse set of skills. The visualization shows how your collective expertise is distributed across key project domains.
                        </p>
                        <div className="space-y-2">
                          {Object.entries(skillCounts).slice(0, 4).map(([skill, count]: any) => (
                            <div key={skill} className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg">
                              <span className="text-xs font-medium text-zinc-700">{skill}</span>
                              <span className="text-xs font-bold text-zinc-900">{count} Members</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Personal & Project Info */}
                <div className="space-y-8">
                  <div className="bg-zinc-900 text-white rounded-3xl p-8 shadow-xl shadow-zinc-200">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-6">Your Profile</h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-500">Academic Standing</p>
                          <p className="text-xl font-bold">{myInfo?.cgpa.toFixed(2)} CGPA</p>
                        </div>
                      </div>
                      <div className="h-px bg-white/10 w-full" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-500 mb-3">Your Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {myInfo?.skills.map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-white/10 rounded-xl text-xs font-medium border border-white/5">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-6">Project Milestones</h3>
                    <div className="space-y-6">
                      {[
                        { label: 'Team Formation', status: 'Completed', date: 'Feb 27' },
                        { label: 'Proposal Submission', status: 'Pending', date: 'Mar 05' },
                        { label: 'Mid-term Review', status: 'Upcoming', date: 'Mar 25' },
                      ].map((m, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className={`mt-1 w-2 h-2 rounded-full ${m.status === 'Completed' ? 'bg-emerald-500' : m.status === 'Pending' ? 'bg-amber-500' : 'bg-zinc-200'}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-zinc-900">{m.label}</p>
                              <p className="text-[10px] font-mono text-zinc-400">{m.date}</p>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-medium">{m.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-32 text-center bg-white border border-zinc-200 rounded-[40px] shadow-sm">
                <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <LayoutGrid className="w-10 h-10 text-zinc-300" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Awaiting Assignment</h3>
                <p className="text-zinc-500 max-w-md mx-auto px-6">
                  Your instructor is currently processing the team formations. You will be notified once your group assignment is finalized.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeSubTab === 'all-groups' && (
          <motion.div
            key="all-groups"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {groups.map(group => (
              <div key={group.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-lg font-bold">{group.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-1 bg-zinc-100 rounded-lg text-zinc-500">
                    {group.members.length} Members
                  </span>
                </div>
                <div className="space-y-3">
                  {group.members.map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">{member.name}</p>
                        <p className="text-[9px] text-zinc-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeSubTab === 'mentor-chat' && (
          <motion.div
            key="mentor-chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ChatRoom
              user={user}
              roomId={`mentor_${user.id}`}
              title="Mentor Support"
              subtitle="Direct line to Faculty Admin"
            />
          </motion.div>
        )}

        {activeSubTab === 'team-chat' && (
          <motion.div
            key="team-chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {myGroup ? (
              <ChatRoom
                user={user}
                roomId={`group_${myGroup.id}`}
                title={`${myGroup.name} Chat`}
                subtitle="Common team workspace"
              />
            ) : (
              <div className="py-32 text-center bg-white border border-zinc-200 rounded-[40px] shadow-sm">
                <p className="text-zinc-500">Join a group to start chatting with your team.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeSubTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-8">
              <div>
                <h3 className="text-xl font-serif font-bold mb-6">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Email Notifications</p>
                      <p className="text-xs text-zinc-500">Receive updates about team formation</p>
                    </div>
                    <div className="w-12 h-6 bg-zinc-900 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Public Profile</p>
                      <p className="text-xs text-zinc-500">Allow other students to see your skills</p>
                    </div>
                    <div className="w-12 h-6 bg-zinc-900 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold mb-6">Preferences</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Preferred Team Role</label>
                    <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none">
                      <option>Team Leader</option>
                      <option>Developer</option>
                      <option>Documentation Lead</option>
                      <option>Presenter</option>
                    </select>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors">
                Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FacultyChat: React.FC<{ user: UserType, groups: Group[] }> = ({ user, groups }) => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [roomTitle, setRoomTitle] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px]">
      <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-y-auto">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-6">Active Groups</h3>
        <div className="space-y-2">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => {
                setSelectedRoom(`group_${group.id}`);
                setRoomTitle(group.name);
              }}
              className={`w-full text-left p-4 rounded-2xl transition-all ${selectedRoom === `group_${group.id}`
                  ? 'bg-zinc-900 text-white shadow-lg'
                  : 'hover:bg-zinc-50 text-zinc-600'
                }`}
            >
              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 opacity-50" />
                <span className="text-sm font-bold">{group.name}</span>
              </div>
            </button>
          ))}
        </div>

        <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mt-8 mb-6">Individual Students</h3>
        <div className="space-y-2">
          {groups.flatMap(g => g.members).map(student => (
            <button
              key={student.id}
              onClick={() => {
                setSelectedRoom(`mentor_${student.id}`);
                setRoomTitle(student.name);
              }}
              className={`w-full text-left p-4 rounded-2xl transition-all ${selectedRoom === `mentor_${student.id}`
                  ? 'bg-zinc-900 text-white shadow-lg'
                  : 'hover:bg-zinc-50 text-zinc-600'
                }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 opacity-50" />
                <span className="text-sm font-bold">{student.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-3">
        {selectedRoom ? (
          <ChatRoom
            user={user}
            roomId={selectedRoom}
            title={roomTitle}
            subtitle={selectedRoom.startsWith('group') ? 'Group Channel' : 'Direct Support'}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white border border-zinc-200 rounded-3xl text-zinc-400">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a group or student to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

const GroupUploads: React.FC<{ groups: Group[], classId: number | null }> = ({ groups, classId }) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [grading, setGrading] = useState<{ id: number, marks: string, comments: string } | null>(null);

  useEffect(() => {
    if (classId) {
      fetch(`/api/submissions?classId=${classId}`)
        .then(res => res.json())
        .then(data => setSubmissions(data));
    }
  }, [classId]);

  const handleGrade = async () => {
    if (!grading) return;
    await fetch(`/api/submissions/${grading.id}/grade`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marks: parseFloat(grading.marks), comments: grading.comments })
    });
    setGrading(null);
    // Refresh
    fetch(`/api/submissions?classId=${classId}`)
      .then(res => res.json())
      .then(data => setSubmissions(data));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Group Submissions</h2>
          <p className="text-zinc-500 text-sm">Review and grade project works uploaded by teams.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => {
          const groupSubmissions = submissions.filter(s => s.group_id === group.id);
          return (
            <div key={group.id} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-lg font-bold">{group.name}</h3>
                <UploadCloud className="w-5 h-5 text-zinc-300" />
              </div>

              <div className="space-y-4 flex-1">
                {groupSubmissions.length === 0 ? (
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-center">
                    <p className="text-xs text-zinc-400">No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupSubmissions.map(sub => (
                      <div key={sub.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 truncate max-w-[150px]">{sub.file_name}</span>
                          <a href={sub.file_url} target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 underline">View</a>
                        </div>

                        {sub.marks !== null ? (
                          <div className="pt-2 border-t border-zinc-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] uppercase font-bold text-zinc-400">Marks</span>
                              <span className="text-xs font-bold text-zinc-900">{sub.marks}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 italic">"{sub.comments}"</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => setGrading({ id: sub.id, marks: '', comments: '' })}
                            className="w-full py-1.5 bg-zinc-900 text-white rounded-lg text-[10px] font-bold"
                          >
                            Grade Submission
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {grading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setGrading(null)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-xl font-serif font-bold mb-6">Grade Submission</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Marks</label>
                  <input
                    type="number"
                    value={grading.marks}
                    onChange={(e) => setGrading({ ...grading, marks: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none"
                    placeholder="Enter marks"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Comments</label>
                  <textarea
                    value={grading.comments}
                    onChange={(e) => setGrading({ ...grading, comments: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none h-24 resize-none"
                    placeholder="Add feedback..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setGrading(null)} className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium">Cancel</button>
                  <button onClick={handleGrade} className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium">Save Grade</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FacultyTest: React.FC<{ classId: number | null }> = ({ classId }) => {
  const [tests, setTests] = useState<any[]>([]);
  const [type, setType] = useState<'sheet' | 'manual'>('sheet');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (classId) {
      fetch(`/api/tests?classId=${classId}`)
        .then(res => res.json())
        .then(data => setTests(data));
    }
  }, [classId]);

  const handleAddTest = async () => {
    if (!classId || !content) return;
    await fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId, type, content })
    });
    setContent('');
    // Refresh
    fetch(`/api/tests?classId=${classId}`)
      .then(res => res.json())
      .then(data => setTests(data));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Test Configuration</h2>
          <p className="text-zinc-500 text-sm">Upload question sheets or set manual question counts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold">Add New Test</h3>

          <div className="space-y-4">
            <div className="flex p-1 bg-zinc-100 rounded-xl">
              <button
                onClick={() => setType('sheet')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'sheet' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
              >
                Question Sheet
              </button>
              <button
                onClick={() => setType('manual')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'manual' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
              >
                Manual Count
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">
                {type === 'sheet' ? 'Sheet URL' : 'Number of Questions'}
              </label>
              <input
                type={type === 'sheet' ? 'text' : 'number'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none"
                placeholder={type === 'sheet' ? 'https://...' : 'e.g. 50'}
              />
            </div>

            <button
              onClick={handleAddTest}
              className="w-full py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Configure Test
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h3 className="font-serif text-lg font-bold mb-6">Active Tests</h3>
          <div className="space-y-4">
            {tests.length === 0 ? (
              <div className="py-12 text-center text-zinc-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No tests configured for this class.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tests.map(test => (
                  <div key={test.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-900">
                        {test.type === 'sheet' ? <FileText className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{test.type === 'sheet' ? 'Question Sheet' : 'Manual Count'}</p>
                        <p className="text-[10px] text-zinc-500">{test.content} {test.type === 'manual' ? 'Questions' : ''}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400">{new Date(test.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FacultyProfile: React.FC<{ user: UserType }> = ({ user }) => {
  const [profile, setProfile] = useState({
    full_name: '',
    department: '',
    designation: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/faculty/profile/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setProfile({
          full_name: data.full_name || user.name,
          department: data.department || '',
          designation: data.designation || '',
          bio: data.bio || ''
        });
        setLoading(false);
      });
  }, [user.id, user.name]);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/faculty/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, ...profile })
    });
    setSaving(false);
  };

  if (loading) return <div className="p-20 text-center text-zinc-400">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white border border-zinc-200 rounded-3xl p-10 shadow-sm">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center text-white text-3xl font-serif">
            {profile.full_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold text-zinc-900">{profile.full_name}</h2>
            <p className="text-zinc-500">{profile.designation || 'Faculty Member'} • {profile.department || 'Academic Department'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-zinc-900/5 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Department</label>
            <input
              type="text"
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-zinc-900/5 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Designation</label>
            <input
              type="text"
              value={profile.designation}
              onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-zinc-900/5 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Email Address</label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none opacity-60"
            />
          </div>
        </div>

        <div className="space-y-1.5 mb-10">
          <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">About / Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none h-32 resize-none focus:ring-2 ring-zinc-900/5 transition-all"
            placeholder="Tell us about your academic background..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
        >
          {saving ? 'Saving...' : 'Update Profile'}
        </button>
      </div>
    </div>
  );
};

const FacultySettings: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-8">
        <div>
          <h3 className="text-xl font-serif font-bold mb-6">Faculty Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div>
                <p className="text-sm font-bold text-zinc-900">Auto-Generate Groups</p>
                <p className="text-xs text-zinc-500">Automatically form groups when student count reaches threshold</p>
              </div>
              <div className="w-12 h-6 bg-zinc-900 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div>
                <p className="text-sm font-bold text-zinc-900">AI Insights</p>
                <p className="text-xs text-zinc-500">Enable Gemini-powered analysis of group balance</p>
              </div>
              <div className="w-12 h-6 bg-zinc-900 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-serif font-bold mb-6">Class Configuration</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Default Group Size</label>
              <input type="number" defaultValue={4} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Project Deadline</label>
              <input type="date" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none" />
            </div>
          </div>
        </div>

        <button className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors">
          Save Faculty Settings
        </button>
      </div>
    </div>
  );
};

const ClassList: React.FC<{
  classes: Class[],
  onSelect: (id: number) => void,
  onCreate: (name: string) => void,
  onDelete: (id: number) => void,
  onGenerate: () => void,
  selectedId: number | null
}> = ({ classes, onSelect, onCreate, onDelete, onGenerate, selectedId }) => {
  const [newClassName, setNewClassName] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Academic Classes</h2>
          <p className="text-zinc-500 text-sm">Select a class to manage students and groups.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Class Name (e.g. CS101)"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            className="bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none w-48 focus:ring-2 ring-zinc-900/5 transition-all"
          />
          <button
            onClick={() => {
              if (newClassName) {
                onCreate(newClassName);
                setNewClassName('');
              }
            }}
            className="bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(cls => (
          <div
            key={cls.id}
            onClick={() => onSelect(cls.id)}
            className={`p-6 rounded-3xl border text-left transition-all cursor-pointer relative group ${selectedId === cls.id
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl scale-[1.02]'
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'
              }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this class and all associated groups?')) {
                  onDelete(cls.id);
                }
              }}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <BookOpen className={`w-5 h-5 ${selectedId === cls.id ? 'text-zinc-400' : 'text-zinc-300'}`} />
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Academic Class</span>
            </div>
            <h3 className="text-lg font-serif font-bold">{cls.name}</h3>

            {selectedId === cls.id && (
              <div className="mt-6 pt-6 border-t border-white/10 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerate();
                  }}
                  className="flex-1 bg-white text-zinc-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate Groups
                </button>
              </div>
            )}

            <p className={`text-xs mt-4 ${selectedId === cls.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {selectedId === cls.id ? 'Currently Selected' : 'Click to view details'}
            </p>
          </div>
        ))}
        {classes.length === 0 && (
          <div className="col-span-full py-12 text-center bg-zinc-100 rounded-3xl border-2 border-dashed border-zinc-200">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-zinc-500">No classes created yet. Create your first class above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'groups' | 'analytics' | 'chat' | 'uploads' | 'settings'>('students');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupSize, setGroupSize] = useState(4);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '',
    cgpa: 3.5,
    skills: [],
    gender: 'Male',
    email: ''
  });

  useEffect(() => {
    if (user) {
      if (user.role === 'student' && user.class_id) {
        setSelectedClassId(user.class_id);
      }
      fetchClasses();
      fetchStudents();
      fetchGroups();
    }
  }, [user, selectedClassId]);

  const fetchClasses = async () => {
    const res = await fetch('/api/classes');
    const data = await res.json();
    setClasses(data);
  };

  const fetchStudents = async () => {
    const url = selectedClassId ? `/api/students?classId=${selectedClassId}` : '/api/students';
    const res = await fetch(url);
    const data = await res.json();
    setStudents(data);
  };

  const fetchGroups = async () => {
    const url = selectedClassId ? `/api/groups?classId=${selectedClassId}` : '/api/groups';
    const res = await fetch(url);
    const data = await res.json();
    setGroups(data);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newStudent, class_id: selectedClassId })
    });
    setShowAddModal(false);
    fetchStudents();
    setNewStudent({ name: '', cgpa: 3.5, skills: [], gender: 'Male', email: '' });
  };

  const handleCreateClass = async (name: string) => {
    await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    fetchClasses();
  };

  const handleDeleteClass = async (id: number) => {
    await fetch(`/api/classes/${id}`, { method: 'DELETE' });
    if (selectedClassId === id) setSelectedClassId(null);
    fetchClasses();
  };

  const handleDeleteStudent = async (id: number) => {
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    fetchStudents();
  };

  const handleGenerateGroups = async () => {
    if (!selectedClassId) {
      alert("Please select a class first");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/groups/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupSize, classId: selectedClassId })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGroups(data);
      setActiveTab('groups');

      // Get AI Insights
      const insight = await getGroupInsights(data);
      setAiInsight(insight);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedClassId) {
      alert("Please select a class first to load sample data into");
      return;
    }
    const sampleStudents = [
      { name: "Alice Johnson", cgpa: 3.9, skills: ["Coding", "AI/ML"], gender: "Female", email: "alice@example.edu" },
      { name: "Bob Smith", cgpa: 3.2, skills: ["Documentation", "Presentation"], gender: "Male", email: "bob@example.edu" },
      { name: "Charlie Davis", cgpa: 3.7, skills: ["Coding", "Database"], gender: "Male", email: "charlie@example.edu" },
      { name: "Diana Prince", cgpa: 3.5, skills: ["Presentation", "UI/UX"], gender: "Female", email: "diana@example.edu" },
      { name: "Ethan Hunt", cgpa: 3.1, skills: ["Coding", "Networking"], gender: "Male", email: "ethan@example.edu" },
      { name: "Fiona Gallagher", cgpa: 3.8, skills: ["Documentation", "Management"], gender: "Female", email: "fiona@example.edu" },
      { name: "George Costanza", cgpa: 2.8, skills: ["Presentation"], gender: "Male", email: "george@example.edu" },
      { name: "Hannah Abbott", cgpa: 3.6, skills: ["Coding", "Documentation"], gender: "Female", email: "hannah@example.edu" },
    ];

    await fetch('/api/students/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: sampleStudents, class_id: selectedClassId })
    });
    fetchStudents();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Team Leader': return <GraduationCap className="w-4 h-4" />;
      case 'Developer': return <Code2 className="w-4 h-4" />;
      case 'Documentation Lead': return <FileText className="w-4 h-4" />;
      case 'Presenter': return <Presentation className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  // Analytics Data
  const cgpaDistribution = groups.map(g => ({
    name: g.name,
    avgCgpa: g.members.length > 0
      ? Number((g.members.reduce((acc, m) => acc + m.cgpa, 0) / g.members.length).toFixed(2))
      : 0
  }));

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* Sidebar Navigation */}
      <AnimatePresence>
        {user.role === 'faculty' && (sidebarOpen || window.innerWidth > 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`fixed lg:relative z-50 w-64 h-screen bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 ease-in-out`}
          >
            <div className="p-6 flex items-center gap-3 border-b border-zinc-100">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold tracking-tight">SmartGroup</h1>
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Faculty Portal</p>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {[
                { id: 'students', icon: Users, label: 'Students' },
                { id: 'groups', icon: LayoutGrid, label: 'Groups' },
                { id: 'test', icon: ClipboardList, label: 'TEST' },
                { id: 'analytics', icon: PieChart, label: 'Analytics' },
                { id: 'chat', icon: MessageSquare, label: 'Mentor Chat' },
                { id: 'uploads', icon: UploadCloud, label: 'Uploads' },
                { id: 'profile', icon: UserCircle, label: 'Profile' },
                { id: 'settings', icon: Settings, label: 'Settings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${activeTab === tab.id
                      ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-zinc-100">
              <div className="bg-zinc-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">{user.name}</p>
                  <button onClick={() => setUser(null)} className="text-[10px] text-rose-500 font-bold hover:underline">Sign Out</button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {user.role === 'faculty' && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-500 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            {user.role === 'student' && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h1 className="font-serif text-lg font-bold">SmartGroup AI</h1>
              </div>
            )}
            <div className="h-6 w-px bg-zinc-200 hidden sm:block" />
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-zinc-900 capitalize">{activeTab}</h2>
            </div>
            {user.role === 'faculty' && classes.length > 0 && (
              <>
                <div className="h-6 w-px bg-zinc-200 hidden md:block" />
                <select
                  value={selectedClassId || ''}
                  onChange={(e) => setSelectedClassId(Number(e.target.value) || null)}
                  className="hidden md:block bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 ring-zinc-900/5 transition-all"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user.role === 'faculty' && (
              <button
                onClick={handleGenerateGroups}
                disabled={loading || students.length === 0}
                className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Generate Groups
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter leading-none mb-1">{user.role}</p>
                <p className="text-xs font-bold text-zinc-900 leading-none">{user.name}</p>
              </div>
              {user.role === 'student' && (
                <button
                  onClick={() => setUser(null)}
                  className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
                >
                  <User className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-10">
            {user.role === 'student' ? (
              <StudentDashboard user={user} groups={groups} />
            ) : (
              <AnimatePresence mode="wait">
                {!selectedClassId && (activeTab === 'students' || activeTab === 'groups' || activeTab === 'analytics') ? (
                  <motion.div
                    key="no-class"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-10"
                  >
                    <ClassList
                      classes={classes}
                      onSelect={setSelectedClassId}
                      onCreate={handleCreateClass}
                      onDelete={handleDeleteClass}
                      onGenerate={handleGenerateGroups}
                      selectedId={selectedClassId}
                    />

                    <div className="py-20 text-center bg-white border border-zinc-200 rounded-3xl">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-zinc-200" />
                      <h3 className="text-xl font-serif font-bold text-zinc-900">No Class Selected</h3>
                      <p className="text-zinc-500">Please select or create a class above to manage students and groups.</p>
                    </div>
                  </motion.div>
                ) : (
                  <div key="content" className="space-y-10">
                    {activeTab === 'groups' && (
                      <ClassList
                        classes={classes}
                        onSelect={setSelectedClassId}
                        onCreate={handleCreateClass}
                        onDelete={handleDeleteClass}
                        onGenerate={handleGenerateGroups}
                        selectedId={selectedClassId}
                      />
                    )}

                    {activeTab === 'students' && (
                      <motion.div
                        key="students"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <ClassList
                          classes={classes}
                          onSelect={setSelectedClassId}
                          onCreate={handleCreateClass}
                          onDelete={handleDeleteClass}
                          onGenerate={handleGenerateGroups}
                          selectedId={selectedClassId}
                        />
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-2xl font-serif font-bold">Student Roster</h2>
                            <p className="text-zinc-500 text-sm">Manage your class list and academic data.</p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleBulkUpload}
                              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors"
                            >
                              <Upload className="w-4 h-4" />
                              Load Sample Data
                            </button>
                            <button
                              onClick={() => setShowAddModal(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
                            >
                              <UserPlus className="w-4 h-4" />
                              Add Student
                            </button>
                          </div>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-zinc-50 border-bottom border-zinc-200">
                                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-zinc-500">Name</th>
                                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-zinc-500">CGPA</th>
                                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-zinc-500">Skills</th>
                                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-zinc-500">Gender</th>
                                <th className="px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-zinc-500 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                              {students.map((student) => (
                                <tr key={student.id} className="hover:bg-zinc-50/50 transition-colors group">
                                  <td className="px-6 py-4">
                                    <div className="font-medium text-zinc-900">{student.name}</div>
                                    <div className="text-xs text-zinc-500">{student.email}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${student.cgpa >= 3.5 ? 'bg-emerald-50 text-emerald-700' :
                                        student.cgpa >= 3.0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                                      }`}>
                                      {student.cgpa.toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                      {student.skills.map((skill, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md text-[10px] font-medium">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-zinc-600">{student.gender}</td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={() => handleDeleteStudent(student.id)}
                                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {students.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No students added yet.</p>
                                    <button onClick={handleBulkUpload} className="text-zinc-900 font-medium underline mt-2">Load sample data</button>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'groups' && (
                      <motion.div
                        key="groups"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-2xl font-serif font-bold">Generated Groups</h2>
                            <p className="text-zinc-500 text-sm">Optimized teams based on academic and skill balance.</p>
                          </div>
                          <div className="flex items-center gap-4 bg-white p-2 border border-zinc-200 rounded-2xl">
                            <div className="flex items-center gap-2 px-3">
                              <Settings className="w-4 h-4 text-zinc-400" />
                              <span className="text-xs font-medium text-zinc-500">Group Size:</span>
                              <input
                                type="number"
                                value={isNaN(groupSize) ? '' : groupSize}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setGroupSize(isNaN(val) ? NaN : val);
                                }}
                                onBlur={() => {
                                  if (isNaN(groupSize) || groupSize < 1) setGroupSize(4);
                                }}
                                className="w-12 bg-zinc-100 rounded-lg px-2 py-1 text-xs font-bold text-center outline-none"
                              />
                            </div>
                            <button
                              onClick={handleGenerateGroups}
                              className="bg-zinc-900 text-white px-4 py-1.5 rounded-xl text-xs font-medium hover:bg-zinc-800 transition-colors"
                            >
                              Re-generate
                            </button>
                          </div>
                        </div>

                        {aiInsight && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex gap-4"
                          >
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-indigo-900 font-bold text-sm mb-1">AI Group Insight</h3>
                              <p className="text-indigo-800/80 text-sm leading-relaxed">{aiInsight}</p>
                            </div>
                          </motion.div>
                        )}

                        <div className="data-grid">
                          {groups.map((group) => (
                            <motion.div
                              key={group.id}
                              layout
                              className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="font-serif text-lg font-bold">{group.name}</h3>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Avg CGPA</span>
                                  <span className="text-sm font-bold text-zinc-900">
                                    {group.members.length > 0
                                      ? (group.members.reduce((acc, m) => acc + m.cgpa, 0) / group.members.length).toFixed(2)
                                      : '0.00'}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {group.members.map((member) => (
                                  <div key={member.id} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50/50 border border-transparent hover:border-zinc-100 transition-all">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${member.role === 'Team Leader' ? 'bg-amber-100 text-amber-700' :
                                        member.role === 'Developer' ? 'bg-blue-100 text-blue-700' :
                                          member.role === 'Documentation Lead' ? 'bg-zinc-200 text-zinc-700' : 'bg-zinc-100 text-zinc-500'
                                      }`}>
                                      {getRoleIcon(member.role || '')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-bold text-zinc-900 truncate">{member.name}</span>
                                        <span className="text-[10px] font-mono text-zinc-400">{member.cgpa.toFixed(1)}</span>
                                      </div>
                                      <div className="text-[10px] text-zinc-500 font-medium mb-1.5">{member.role}</div>
                                      <div className="flex flex-wrap gap-1">
                                        {member.skills.slice(0, 2).map((skill, idx) => (
                                          <span key={idx} className="px-1.5 py-0.5 bg-white border border-zinc-100 text-zinc-400 rounded text-[9px]">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                          {groups.length === 0 && (
                            <div className="col-span-full py-20 text-center text-zinc-400">
                              <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-20" />
                              <p>No groups generated yet.</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'test' && (
                      <motion.div
                        key="test"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <FacultyTest classId={selectedClassId} />
                      </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                      <motion.div
                        key="analytics"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        <ClassList
                          classes={classes}
                          onSelect={setSelectedClassId}
                          onCreate={handleCreateClass}
                          onDelete={handleDeleteClass}
                          onGenerate={handleGenerateGroups}
                          selectedId={selectedClassId}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                            <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Total Students</p>
                            <h3 className="text-3xl font-serif font-bold">{students.length}</h3>
                          </div>
                          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                            <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Total Groups</p>
                            <h3 className="text-3xl font-serif font-bold">{groups.length}</h3>
                          </div>
                          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                            <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Class Avg CGPA</p>
                            <h3 className="text-3xl font-serif font-bold">
                              {(students.reduce((acc, s) => acc + s.cgpa, 0) / (students.length || 1)).toFixed(2)}
                            </h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                            <h3 className="font-serif text-xl font-bold mb-6">CGPA Balance Across Groups</h3>
                            <div className="h-[300px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cgpaDistribution}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                  <YAxis domain={[0, 4]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                  <Tooltip
                                    cursor={{ fill: '#f8f8f8' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                  />
                                  <Bar dataKey="avgCgpa" radius={[6, 6, 0, 0]}>
                                    {cgpaDistribution.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#18181b' : '#3f3f46'} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                            <h3 className="font-serif text-xl font-bold mb-6">Skill Distribution</h3>
                            <div className="h-[300px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                  { subject: 'Coding', A: 120, fullMark: 150 },
                                  { subject: 'UI/UX', A: 98, fullMark: 150 },
                                  { subject: 'Docs', A: 86, fullMark: 150 },
                                  { subject: 'Presentation', A: 99, fullMark: 150 },
                                  { subject: 'AI/ML', A: 85, fullMark: 150 },
                                  { subject: 'Database', A: 65, fullMark: 150 },
                                ]}>
                                  <PolarGrid stroke="#f0f0f0" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#888' }} />
                                  <Radar name="Skills" dataKey="A" stroke="#18181b" fill="#18181b" fillOpacity={0.1} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {activeTab === 'chat' && (
                      <motion.div
                        key="chat"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <FacultyChat user={user} groups={groups} />
                      </motion.div>
                    )}

                    {activeTab === 'uploads' && (
                      <motion.div
                        key="uploads"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <GroupUploads groups={groups} classId={selectedClassId} />
                      </motion.div>
                    )}

                    {activeTab === 'profile' && (
                      <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <FacultyProfile user={user} />
                      </motion.div>
                    )}

                    {activeTab === 'settings' && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <FacultySettings />
                      </motion.div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
        </main>

        {/* Add Student Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <h3 className="text-2xl font-serif font-bold mb-6">Add New Student</h3>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Full Name</label>
                        <input
                          required
                          type="text"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-zinc-900/5 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">CGPA</label>
                        <input
                          required
                          type="number"
                          step="0.01"
                          min="0"
                          max="4"
                          value={newStudent.cgpa}
                          onChange={(e) => setNewStudent({ ...newStudent, cgpa: parseFloat(e.target.value) })}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-zinc-900/5 transition-all"
                          placeholder="3.85"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Email Address</label>
                      <input
                        required
                        type="email"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-zinc-900/5 transition-all"
                        placeholder="john@university.edu"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Gender</label>
                        <select
                          value={newStudent.gender}
                          onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as any })}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-zinc-900/5 transition-all"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Primary Skills</label>
                        <input
                          type="text"
                          placeholder="Coding, Docs (comma separated)"
                          onChange={(e) => setNewStudent({ ...newStudent, skills: e.target.value.split(',').map(s => s.trim()) })}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-zinc-900/5 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
                      >
                        Add Student
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <footer className="py-8 px-6 border-t border-zinc-200 text-center">
          <p className="text-xs text-zinc-400 font-medium">© 2026 SmartGroup AI • Intelligent Academic Automation</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
