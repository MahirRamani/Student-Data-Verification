// src/validation/schemas.ts
import { z } from "zod";

// Helper function to capitalize first letter of each word
const toProperCase = (value: string): string => {
  return value
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to format address properly
const formatAddress = (value: string): string => {
  return value
    .split(',')
    .map(part => toProperCase(part.trim()))
    .join(', ');
};

// Login schema
export const loginSchema = z.object({
  roll_no: z.coerce
    .number()
    .int("Roll number must be an integer")
    .positive("Roll number must be positive"),
  password: z.string().min(1, "Password is required"),
});

// Student schema
export const studentSchema = z.object({
  roll_no: z.string().min(1, "Roll number is required"),
  name: z.string()
    .min(1, "Name is required")
    .refine((value) => value.trim().split(/\s+/).length >= 3, {
      message: "Name must contain at least three words",
    })
    .transform(toProperCase),
  date_of_birth: z.string()
    .refine((value) => !isNaN(Date.parse(value)), {
      message: "Invalid date format",
    }),
  email: z.string().email("Invalid email address"),
  mobile_number: z.string()
    .regex(/^\+?[0-9]{10,15}$/, "Mobile number must be between 10-15 digits"),
  father_mobile_number: z.string()
    .regex(/^\+?[0-9]{10,15}$/, "Father's mobile number must be between 10-15 digits"),
  field_of_study: z.string().min(1, "Field of study is required"),
  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .transform(formatAddress),
  // branch is removed
  taluka: z.string().min(1, "Taluka is required"),
  city: z.string().min(1, 'City is required'),  // New city field
  district: z.string().min(1, "District is required"),
  pincode: z.string()
    .regex(/^\d{6}$/, "Pincode must be a 6-digit number"),
});

// Update details form schema
export const updateDetailsSchema = z.object({
  roll_no: z.string().min(1, 'Roll number is required'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .refine(name => {
      const wordCount = name.trim().split(/\s+/).length;
      return wordCount <= 3;
    }, { message: "Name should not contain more than 3 words" }),
  date_of_birth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
  mobile_number: z.string()
    .min(1, "Mobile number is required")
    .refine(val => /^\+[0-9]{1,4}[0-9]{10,14}$/.test(val), {
      message: "Mobile number must include country code (e.g., +91XXXXXXXXXX)"
    }),
  email: z.string()
    .min(1, "Email is required")
    .email('Please enter a valid email address'),
  father_mobile_number: z.string()
    .min(1, "Father's mobile number is required")
    .refine(val => /^\+[0-9]{1,4}[0-9]{10,14}$/.test(val), {
      message: "Father's mobile number must include country code (e.g., +91XXXXXXXXXX)"
    }),
  field_of_study: z.string().min(1, 'Field of study is required'),
  address: z.string().min(1, 'Address is required')
    .max(500, 'Address must be at most 500 characters'),
  taluka: z.string().min(1, 'Taluka is required'),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, 'District is required'),
  pincode: z.string()
    .regex(/^\d{6}$/, "Pincode must be a 6-digit number"),
  is_data_verified: z.boolean().optional(),
});

export type UpdateDetailsInput = z.infer<typeof updateDetailsSchema>;

export const otpVerificationSchema = z.object({
  mobile_number: z.string()
    .min(1, "Mobile number is required")
    .refine(val => /^\+[0-9]{1,4}[0-9]{10,14}$/.test(val), {
      message: "Mobile number must include country code (e.g., +91XXXXXXXXXX)"
    }),
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});


export type LoginInput = z.infer<typeof loginSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>;