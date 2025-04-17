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
    lastActivity: Date.now()
  };
  
  // const storedSession = localStorage.getItem('studentSession');
  // // If there's a stored session, use it as initial state
  // if (storedSession) {
  //   try {
  //     const parsedSession = JSON.parse(storedSession);
  //     const lastActivity = localStorage.getItem('lastActivity');
      
  //     if (lastActivity) {
  //       const inactiveTime = (Date.now() - parseInt(lastActivity)) / 1000 / 60;
  //       console.log("Inactive time:", inactiveTime);
        
  //       if (inactiveTime < 1) { // 30 minutes timeout
  //         initialState = {
  //           ...initialState,
  //           ...parsedSession,
  //           isAuthenticated: true,
  //           lastActivity: parseInt(lastActivity)
  //         };
  //       } else {
  //         // Session timed out, remove it
  //         localStorage.removeItem('studentSession');
  //         localStorage.removeItem('lastActivity');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Failed to parse stored session:', error);
  //     localStorage.removeItem('studentSession');
  //     localStorage.removeItem('lastActivity');
  //   }
  // }

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
          email: newState.email,
          mobile_number: newState.mobile_number,
          father_mobile_number: newState.father_mobile_number,
          date_of_birth: newState.date_of_birth,
          address: newState.address,
          field_of_study: newState.field_of_study,
          branch: newState.branch,
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
      });
    }
  };
});

// // src/store/studentStore.ts
// import { create } from 'zustand';
// import { Student } from '../types/students';

// interface StudentStore extends Student {
//   isAuthenticated: boolean;
//   lastActivity: number;
//   setStudentData: (data: Partial<Student>) => void;
//   updateLastActivity: () => void;
//   logout: () => void;
// }

// export const useStudentStore = create<StudentStore>((set) => ({
//   id: '',
//   roll_no: '',
//   name: '',
//   email: '',
//   mobile_number: '',
//   father_mobile_number: '',
//   date_of_birth: '',
//   address: '',
//   field_of_study: '',
//   branch: '',
//   is_data_verified: false,
//   is_mobile_verified: false,
//   isAuthenticated: false,
//   lastActivity: Date.now(),
  
//   setStudentData: (data) => set((state) => ({ 
//     ...state, 
//     ...data, 
//     isAuthenticated: true,
//     lastActivity: Date.now() 
//   })),
  
//   updateLastActivity: () => set((state) => ({ 
//     ...state, 
//     lastActivity: Date.now() 
//   })),
  
//   logout: () => set({
//     id: '',
//     roll_no: '',
//     name: '',
//     email: '',
//     mobile_number: '',
//     father_mobile_number: '',
//     date_of_birth: '',
//     address: '',
//     field_of_study: '',
//     branch: '',
//     is_data_verified: false,
//     is_mobile_verified: false,
//     isAuthenticated: false,
//     lastActivity: 0
//   })
// }));