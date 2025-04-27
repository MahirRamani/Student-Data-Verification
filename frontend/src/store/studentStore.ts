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

export const useStudentStore = create<StudentStore>((set) => {
  // Check for existing session on store initialization
  let initialState = {
    id: '',
    roll_no: '',
    name: '',
    date_of_birth: '',
    mobile_number: '',
    email: '',
    father_mobile_number: '',
    field_of_study: '',  // Keep this field
    // branch field is removed
    address: '',
    taluka: '',
    city: '',  // New city field
    district: '',
    pincode: '',
    is_data_verified: false,
    is_mobile_verified: false,
    isAuthenticated: false,
    lastActivity: Date.now()
  };

  return {
    ...initialState,
    
    setStudentData: (data) => {
      set((state) => {
        const newState = { 
          ...state, 
          ...data, 
          isAuthenticated: true,
          lastActivity: Date.now() 
        };
        
        // Store student data in localStorage for persistence
        const sessionData = {
          id: newState.id,
          roll_no: newState.roll_no,
          name: newState.name,
          date_of_birth: newState.date_of_birth,
          mobile_number: newState.mobile_number,
          email: newState.email,
          father_mobile_number: newState.father_mobile_number,
          field_of_study: newState.field_of_study,  // Keep this field
          address: newState.address,
          // branch field is removed
          taluka: newState.taluka,
          city: newState.city,  // New city field
          district: newState.district,
          pincode: newState.pincode,
          is_data_verified: newState.is_data_verified,
          is_mobile_verified: newState.is_mobile_verified
        };
        
        localStorage.setItem('studentSession', JSON.stringify(sessionData));
        localStorage.setItem('lastActivity', Date.now().toString());
        
        return newState;
      });
    },
    
    updateLastActivity: () => {
      localStorage.setItem('lastActivity', Date.now().toString());
      set((state) => ({ 
        ...state, 
        lastActivity: Date.now() 
      }));
    },
    
    logout: () => {
      localStorage.removeItem('studentSession');
      localStorage.removeItem('lastActivity');
      set({
        id: '',
        roll_no: '',
        name: '',
        date_of_birth: '',
        mobile_number: '',
        email: '',
        father_mobile_number: '',
        field_of_study: '',  // Keep this field
        // branch field is removed
        address: '',
        taluka: '',
        city: '',  // New city field
        district: '',
        pincode: '',
        is_data_verified: false,
        is_mobile_verified: false,
        isAuthenticated: false,
        lastActivity: 0
      });
    }
  };
});
