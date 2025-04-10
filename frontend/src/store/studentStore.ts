// src/store/studentStore.ts
import { create } from 'zustand';
import { Student } from '../types/students';

interface StudentStore extends Student {
  isAuthenticated: boolean;
  lastActivity: number;
  setStudentData: (data: Partial<Student>) => void;
  updateLastActivity: () => void;
  logout: () => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  id: '',
  roll_no: '',
  name: '',
  email: '',
  mobile_number: '',
  father_mobile_number: '',
  date_of_birth: '',
  address: '',
  field_of_study: '',
  branch: '',
  is_data_verified: false,
  is_mobile_verified: false,
  isAuthenticated: false,
  lastActivity: Date.now(),
  
  setStudentData: (data) => set((state) => ({ 
    ...state, 
    ...data, 
    isAuthenticated: true,
    lastActivity: Date.now() 
  })),
  
  updateLastActivity: () => set((state) => ({ 
    ...state, 
    lastActivity: Date.now() 
  })),
  
  logout: () => set({
    id: '',
    roll_no: '',
    name: '',
    email: '',
    mobile_number: '',
    father_mobile_number: '',
    date_of_birth: '',
    address: '',
    field_of_study: '',
    branch: '',
    is_data_verified: false,
    is_mobile_verified: false,
    isAuthenticated: false,
    lastActivity: 0
  })
}));