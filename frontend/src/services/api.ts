// src/services/api.ts
import axios from 'axios';
import { UpdateDetailsInput } from '../validation/schemas';

const API_URL =  import.meta.env.VITE_BACKEND_API_URL || 'https://whwp32nl-8000.inc1.devtunnels.ms/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginStudent = async (roll_no: string, password: string) => {
  const response = await api.post('/login/', { roll_no, password });
  return response.data;
};

export const getStudentData = async (roll_no: string) => {
  const response = await api.get(`/students/${roll_no}/`);
  return response.data;
};

export const updateStudentData = async (roll_no: string, data: UpdateDetailsInput) => {
  const response = await api.patch(`/students/${roll_no}/`, data);
  return response.data;
};

// export const requestOtp = async (roll_no: string, mobile_number: string) => {
//   const response = await api.post(`/students/${roll_no}/request_otp/`, { mobile_number });
//   return response.data;
// };

// export const verifyMobileOtp = async (roll_no: string, otp: string) => {
//   const response = await api.post(`/students/${roll_no}/verify_mobile/`, { otp });
//   return response.data;
// };

export const verifyStudentData = async (roll_no: string) => {
  const response = await api.post(`/students/${roll_no}/verify/`);
  return response.data;
};

export const getUpdateHistory = async (roll_no: string) => {
  const response = await api.get(`/students/${roll_no}/history/`);
  return response.data;
};


// // src/services/api.ts
// import axios from 'axios';
// import { Student, UpdateHistory } from '../types/students';

// const API_URL = 'http://localhost:8000/api';

// // Create axios instance with interceptors
// const api = axios.create({
//   baseURL: API_URL,
//   timeout: 10000,
// });

// // Add request interceptor to update last activity time
// api.interceptors.request.use(
//   (config) => {
//     // Update last activity time in local storage
//     localStorage.setItem('lastActivity', Date.now().toString());
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export const loginStudent = async (roll_no: string, password: string): Promise<Student> => {
//   try {
//     const response = await api.post('/login/', { roll_no, password });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const fetchStudentData = async (rollNo: string): Promise<Student> => {
//   try {
//     const response = await api.get(`/students/${rollNo}/`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const updateStudentData = async (rollNo: string, data: Partial<Student>): Promise<Student> => {
//   try {
//     const response = await api.put(`/students/${rollNo}/`, data);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const verifyStudentData = async (rollNo: string): Promise<{ status: string }> => {
//   try {
//     const response = await api.post(`/students/${rollNo}/verify/`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const requestOTP = async (rollNo: string, mobileNumber: string): Promise<{ status: string }> => {
//   try {
//     const response = await api.post(`/students/${rollNo}/request-otp/`, { mobile_number: mobileNumber });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const verifyMobileOtp = async (rollNo: string, otp: string): Promise<{ status: string }> => {
//   try {
//     const response = await api.post(`/students/${rollNo}/verify-mobile/`, { otp });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const fetchUpdateHistory = async (rollNo: string): Promise<UpdateHistory[]> => {
//   try {
//     const response = await api.get(`/students/${rollNo}/history/`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };