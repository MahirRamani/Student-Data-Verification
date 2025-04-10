// src/services/api.ts
import axios from 'axios';
import { Student, UpdateHistory } from '../types/students';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add request interceptor to update last activity time
api.interceptors.request.use(
  (config) => {
    // Update last activity time in local storage
    localStorage.setItem('lastActivity', Date.now().toString());
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginStudent = async (roll_no: string, password: string): Promise<Student> => {
  try {
    const response = await api.post('/login/', { roll_no, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchStudentData = async (rollNo: string): Promise<Student> => {
  try {
    const response = await api.get(`/students/${rollNo}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStudentData = async (rollNo: string, data: Partial<Student>): Promise<Student> => {
  try {
    const response = await api.put(`/students/${rollNo}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyStudentData = async (rollNo: string): Promise<{ status: string }> => {
  try {
    const response = await api.post(`/students/${rollNo}/verify/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const requestOTP = async (rollNo: string, mobileNumber: string): Promise<{ status: string }> => {
  try {
    const response = await api.post(`/students/${rollNo}/request-otp/`, { mobile_number: mobileNumber });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyMobileOtp = async (rollNo: string, otp: string): Promise<{ status: string }> => {
  try {
    const response = await api.post(`/students/${rollNo}/verify-mobile/`, { otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUpdateHistory = async (rollNo: string): Promise<UpdateHistory[]> => {
  try {
    const response = await api.get(`/students/${rollNo}/history/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// // src/services/api.ts - API Service
// import axios from 'axios';

// const API_URL = 'http://localhost:8000/api';

// export const loginStudent = async (roll_no: string, password: string) => {
//   try {
//     console.log("api called");
//     const response = await axios.post(`${API_URL}/login/`, { roll_no, password });
//     console.log(response);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const fetchStudentData = async (studentId: string) => {
//   try {
//     const response = await axios.get(`${API_URL}/students/${studentId}/`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const updateStudentData = async (studentId: string, data: any) => {
//   try {
//     const response = await axios.put(`${API_URL}/students/${studentId}/`, data);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const verifyStudentData = async (studentId: string) => {
//   try {
//     const response = await axios.post(`${API_URL}/students/${studentId}/verify/`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const verifyMobileOtp = async (studentId: string, otp: string) => {
//   try {
//     const response = await axios.post(`${API_URL}/students/${studentId}/verify-mobile/`, { otp });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// // // src/services/api.ts - API Service
// // import axios from 'axios';

// // const API_URL = 'http://localhost:8000/api';

// // export const loginStudent = async (username: string, password: string) => {
// //   try {
// //     const response = await axios.post(`${API_URL}/login/`, { username, password });
// //     return response.data;
// //   } catch (error) {
// //     throw error;
// //   }
// // };

// // export const fetchStudentData = async (studentId: string) => {
// //   try {
// //     const response = await axios.get(`${API_URL}/students/${studentId}/`);
// //     return response.data;
// //   } catch (error) {
// //     throw error;
// //   }
// // };

// // export const updateStudentData = async (studentId: string, data: any) => {
// //   try {
// //     const response = await axios.put(`${API_URL}/students/${studentId}/`, data);
// //     return response.data;
// //   } catch (error) {
// //     throw error;
// //   }
// // };

// // export const verifyStudentData = async (studentId: string) => {
// //   try {
// //     const response = await axios.post(`${API_URL}/students/${studentId}/verify/`);
// //     return response.data;
// //   } catch (error) {
// //     throw error;
// //   }
// // };