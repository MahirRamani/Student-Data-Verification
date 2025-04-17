// src/types/student.ts
export interface Student {
    id: string;
    roll_no: string;
    name: string;
    email: string;
    mobile_number: string;
    father_mobile_number: string;
    date_of_birth: string;
    address: string;
    field_of_study: string;
    branch: string;
    is_data_verified: boolean;
    is_mobile_verified: boolean;
  }
  
  export interface UpdateHistory {
    id: string;
    student_id: string;
    update_date: string;
    field_name: string;
    old_value: string;
    new_value: string;
  }
  
  // src/types/student.ts (create this file if it doesn't exist)
export interface StudentUpdateInput {
  roll_no: string;
  name: string;
  email: string;
  mobile_number: string;
  father_mobile_number: string;
  date_of_birth: string;
  address: string;
  field_of_study: string;
  branch: string;
  is_mobile_verified?: boolean;
  is_data_verified?: boolean;
}