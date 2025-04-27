// src/services/api.ts
import axios from 'axios';
import { UpdateDetailsInput } from '../validation/schemas';

const API_URL =  import.meta.env.VITE_BACKEND_API_URL;

console.log("API URL:", API_URL);


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginStudent = async (roll_no: string, password: string) => {
  console.log("Roll no:", roll_no, "Password:",password)
  const response = await api.post('/login/', { roll_no, password });
  console.log("backend response:", response);
  
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

export const verifyStudentData = async (roll_no: string) => {
  const response = await api.post(`/students/${roll_no}/verify/`);
  return response.data;
};

export const getUpdateHistory = async (roll_no: string) => {
  const response = await api.get(`/students/${roll_no}/history/`);
  return response.data;
};