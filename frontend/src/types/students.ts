// src/types/students.ts
export interface Student {
  id: string;
  roll_no: string;
  name: string;
  date_of_birth: string;
  mobile_number: string;
  email: string;
  father_mobile_number: string;
  field_of_study: string;  // Keep this field
  address: string;
  taluka: string;
  city: string;  // New city field
  district: string;
  pincode: string;
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


export interface UpdateHistory {
  id: string;
  student_id: string;
  update_date: string;
  field_name: string;
  old_value: string;
  new_value: string;
}


export interface StudentUpdateInput {
  roll_no: string;
  name: string;
  email: string;
  mobile_number: string;
  father_mobile_number: string;
  date_of_birth: string;
  address: string;
  field_of_study: string;
  taluka: string;
  district: string;
  pincode: string;  // New field
  is_mobile_verified?: boolean;
  is_data_verified?: boolean;
}