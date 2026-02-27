export interface Class {
  id: number;
  name: string;
  created_at?: string;
}

export interface Student {
  id: number;
  name: string;
  cgpa: number;
  skills: string[];
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  role?: string;
  class_id?: number;
}

export interface Group {
  id: number;
  name: string;
  members: Student[];
  created_at?: string;
  class_id?: number;
}

export interface Constraint {
  id: number;
  type: string;
  student1_id?: number;
  student2_id?: number;
  value?: string;
}

export interface User {
  id: number;
  email: string;
  role: 'faculty' | 'student';
  name: string;
  class_id?: number;
}
