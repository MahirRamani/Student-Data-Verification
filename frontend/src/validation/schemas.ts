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
  email: z.string().email("Invalid email address"),
  mobile_number: z.string()
    .regex(/^\+?[0-9]{10,15}$/, "Mobile number must be between 10-15 digits"),
  father_mobile_number: z.string()
    .regex(/^\+?[0-9]{10,15}$/, "Father's mobile number must be between 10-15 digits"),
  date_of_birth: z.string()
    .refine((value) => !isNaN(Date.parse(value)), {
      message: "Invalid date format",
    }),
  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .transform(formatAddress),
  field_of_study: z.string().min(1, "Field of study is required"),
  branch: z.string().min(1, "Branch is required"),
});

// Update details form schema
// export const updateDetailsSchema = studentSchema.partial();
// Update the validation schema for name
// In src/validation/schemas.ts
// import { z } from 'zod';

export const updateDetailsSchema = z.object({
  roll_no: z.string().min(1, 'Roll number is required'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .refine(name => {
      const wordCount = name.trim().split(/\s+/).length;
      return wordCount <= 3;
    }, { message: "Name should not contain more than 3 words" }),
  email: z.string().email('Please enter a valid email address'),
  mobile_number: z.string()
    .regex(/^\+?[0-9]{10,15}$/, "Mobile number must be between 10-15 digits with proper country code"),
  father_mobile_number: z.string()
    .regex(/^\+?[0-9]{10,15}$/, "Father's mobile number must be between 10-15 digits with proper country code"),
  date_of_birth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
  address: z.string().min(1, 'Address is required'),
  field_of_study: z.string().min(1, 'Field of study is required'),
  branch: z.string().min(1, 'Branch is required'),
  // is_mobile_verified: z.boolean(),
  // is_data_verified: z.boolean(),
});

export type UpdateDetailsInput = z.infer<typeof updateDetailsSchema>;

export const otpVerificationSchema = z.object({
  mobile_number: z.string()
    .min(10, 'Mobile number should be at least 10 digits')
    .max(15, 'Mobile number should not exceed 15 digits'),
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});


// OTP verification schema
// export const otpVerificationSchema = z.object({
//   otp: z.string().length(6, "OTP must be 6 digits"),
//   mobile_number: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid mobile number format"),
// });

export type LoginInput = z.infer<typeof loginSchema>;
export type StudentData = z.infer<typeof studentSchema>;
// export type UpdateDetailsInput = z.infer<typeof updateDetailsSchema>;
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>;


// NOTE
// // Validation schema for comprehensive checks
// const validationSchema = z.object({
//   name: z.string().min(3, 'Name must be at least 3 characters long')
//     .refine(name => name.trim().split(/\s+/).length >= 2, 'Name should contain at least two words'),
//   email: z.string().email('Email must be a valid email address'),
//   mobile_number: z.string()
//     .refine(val => /^\+[1-9]\d{1,14}$/.test(val), 'Mobile number must include country code (e.g., +91...)'),
//   father_mobile_number: z.string()
//     .refine(val => /^\+[1-9]\d{1,14}$/.test(val), 'Father\'s mobile number must include country code (e.g., +91...)'),
//   date_of_birth: z.string().min(1, 'Date of birth is required'),
//   address: z.string().min(10, 'Address should be detailed and complete'),
//   field_of_study: z.string().min(1, 'Field of study is required'),
//   branch: z.string().min(1, 'Branch is required'),
// });


// export type ValidationInput = z.infer<typeof validationSchema>;