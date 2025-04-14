// src/components/UpdateDetailsForm.tsx
import React, { useState, useEffect } from 'react';
import { useStudentStore } from '../store/studentStore';
import { updateStudentData } from '../services/api';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateDetailsSchema, UpdateDetailsInput } from '../validation/schemas';
import { isEqual } from 'lodash';

// Field of study options
const FIELD_OPTIONS = [
  "Engineering",
  "Medicine",
  "Arts",
  "Science",
  "Commerce",
  "Law"
];

// Branch options based on field of study
const BRANCH_OPTIONS: Record<string, string[]> = {
  "Engineering": ["Computer Science", "Mechanical", "Electrical", "Civil", "Electronics", "Chemical"],
  "Medicine": ["MBBS", "BDS", "Pharmacy", "Nursing", "Physiotherapy"],
  "Arts": ["History", "Geography", "Political Science", "Economics", "Psychology", "Sociology"],
  "Science": ["Physics", "Chemistry", "Biology", "Mathematics", "Statistics"],
  "Commerce": ["Accounting", "Finance", "Marketing", "Human Resources", "Business Administration"],
  "Law": ["Civil Law", "Criminal Law", "Corporate Law", "International Law", "Family Law"]
};

// Input format guidelines
const INPUT_GUIDELINES = {
  name: "Full name as per official records",
  email: "Valid email address (e.g., example@domain.com)",
  mobile_number: "10-digit mobile number without country code",
  father_mobile_number: "10-digit mobile number without country code",
  date_of_birth: "Format: YYYY-MM-DD",
  address: "Complete address with city, state and PIN code",
};

interface UpdateDetailsFormProps {
  onCancel: () => void;
  onUpdate: () => void;
}

const UpdateDetailsForm: React.FC<UpdateDetailsFormProps> = ({ onCancel, onUpdate }) => {
  const student = useStudentStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  
  // Default values from the store
  const defaultValues = {
    roll_no: student.roll_no || '',
    name: student.name || '',
    email: student.email || '',
    mobile_number: student.mobile_number || '',
    father_mobile_number: student.father_mobile_number || '',
    date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
    address: student.address || '',
    field_of_study: student.field_of_study || '',
    branch: student.branch || '',
  };
  
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<UpdateDetailsInput>({
    resolver: zodResolver(updateDetailsSchema),
    defaultValues
  });
  
  // Watch form values for changes
  const formValues = watch();
  
  // Watch field_of_study to reset branch when it changes
  const fieldOfStudy = watch('field_of_study');
  
  useEffect(() => {
    if (fieldOfStudy !== student.field_of_study) {
      setValue('branch', '');
    }
  }, [fieldOfStudy, student.field_of_study, setValue]);
  
  // Check if there are any actual changes in the data
  useEffect(() => {
    // Filter out roll_no since it's read-only
    const { roll_no, ...currentValues } = formValues;
    const { roll_no: origRoll, ...originalValues } = defaultValues;
    
    setHasChanges(!isEqual(currentValues, originalValues));
  }, [formValues, defaultValues]);
  
  const onSubmit = async (data: UpdateDetailsInput) => {
    // If no changes, show message and return
    if (!hasChanges) {
      setSuccess('No changes detected in your data.');
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedData = await updateStudentData(student.roll_no, data);
      
      // Check if mobile number was changed
      const mobileChanged = data.mobile_number !== student.mobile_number;
      
      student.setStudentData({
        ...updatedData,
        is_data_verified: false,
        is_mobile_verified: !mobileChanged && student.is_mobile_verified
      });
      
      setSuccess('Your details have been updated successfully.');
      
      // Give user time to see success message before continuing
      setTimeout(() => {
        onUpdate();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to update data:', err);
      setError(err.response?.data?.error || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="shadow-none border-none">
      <CardContent className="p-0">
        <div className="mb-4">
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="flex items-center justify-between">
              <span>Please enter your information accurately as per official records.</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="text-blue-600 hover:text-blue-800"
              >
                {showGuidelines ? 'Hide Guidelines' : 'View Input Guidelines'}
              </Button>
            </AlertDescription>
          </Alert>
          
          {showGuidelines && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border">
              <h3 className="font-medium mb-2">Input Guidelines:</h3>
              <ul className="text-sm space-y-1">
                {Object.entries(INPUT_GUIDELINES).map(([field, guideline]) => (
                  <li key={field} className="flex gap-2">
                    <span className="font-medium min-w-32">{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roll_no">Roll No</Label>
              <Input
                id="roll_no"
                {...register('roll_no')}
                readOnly
                className="bg-gray-50"
              />
              {errors.roll_no && (
                <p className="text-sm text-red-500">{errors.roll_no.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile_number">Mobile Number</Label>
              <Input
                id="mobile_number"
                type="tel"
                {...register('mobile_number')}
              />
              {errors.mobile_number && (
                <p className="text-sm text-red-500">{errors.mobile_number.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register('date_of_birth')}
              />
              {errors.date_of_birth && (
                <p className="text-sm text-red-500">{errors.date_of_birth.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="father_mobile_number">Father's Mobile Number</Label>
              <Input
                id="father_mobile_number"
                type="tel"
                {...register('father_mobile_number')}
              />
              {errors.father_mobile_number && (
                <p className="text-sm text-red-500">{errors.father_mobile_number.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="field_of_study">Field of Study</Label>
              <Controller
                name="field_of_study"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field of study" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_OPTIONS.map((fieldOption) => (
                        <SelectItem key={fieldOption} value={fieldOption}>
                          {fieldOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.field_of_study && (
                <p className="text-sm text-red-500">{errors.field_of_study.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Controller
                name="branch"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={!fieldOfStudy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={fieldOfStudy ? "Select branch" : "Select field of study first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOfStudy && 
                        BRANCH_OPTIONS[fieldOfStudy]?.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.branch && (
                <p className="text-sm text-red-500">{errors.branch.message}</p>
              )}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register('address')}
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || (!hasChanges && isDirty)}
            >
              {loading ? 'Saving...' : !hasChanges ? 'No Changes' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdateDetailsForm;

// // src/components/UpdateDetailsForm.tsx
// import React, { useState, useEffect } from 'react';
// import { useStudentStore } from '../store/studentStore';
// import { updateStudentData } from '../services/api';
// import { Card, CardContent } from './ui/card';
// import { Input } from './ui/input';
// import { Button } from './ui/button';
// import { Label } from './ui/label';
// import { Textarea } from './ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from './ui/select';
// import { Alert, AlertDescription } from './ui/alert';
// import { AlertCircle, CheckCircle2 } from 'lucide-react';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { updateDetailsSchema, UpdateDetailsInput } from '../validation/schemas';
// import { isEqual } from 'lodash';

// // Field of study options
// const FIELD_OPTIONS = [
//   "Engineering",
//   "Medicine",
//   "Arts",
//   "Science",
//   "Commerce",
//   "Law"
// ];

// // Branch options based on field of study
// const BRANCH_OPTIONS: Record<string, string[]> = {
//   "Engineering": ["Computer Science", "Mechanical", "Electrical", "Civil", "Electronics", "Chemical"],
//   "Medicine": ["MBBS", "BDS", "Pharmacy", "Nursing", "Physiotherapy"],
//   "Arts": ["History", "Geography", "Political Science", "Economics", "Psychology", "Sociology"],
//   "Science": ["Physics", "Chemistry", "Biology", "Mathematics", "Statistics"],
//   "Commerce": ["Accounting", "Finance", "Marketing", "Human Resources", "Business Administration"],
//   "Law": ["Civil Law", "Criminal Law", "Corporate Law", "International Law", "Family Law"]
// };

// interface UpdateDetailsFormProps {
//   onCancel: () => void;
//   onUpdate: () => void;
// }

// const UpdateDetailsForm: React.FC<UpdateDetailsFormProps> = ({ onCancel, onUpdate }) => {
//   const student = useStudentStore();
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [hasChanges, setHasChanges] = useState(false);
  
//   // Default values from the store
//   const defaultValues = {
//     roll_no: student.roll_no || '',
//     name: student.name || '',
//     email: student.email || '',
//     mobile_number: student.mobile_number || '',
//     father_mobile_number: student.father_mobile_number || '',
//     date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
//     address: student.address || '',
//     field_of_study: student.field_of_study || '',
//     branch: student.branch || '',
//   };
  
//   const {
//     control,
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { errors, isDirty, dirtyFields }
//   } = useForm<UpdateDetailsInput>({
//     resolver: zodResolver(updateDetailsSchema),
//     defaultValues
//   });
  
//   // Watch form values for changes
//   const formValues = watch();
  
//   // Watch field_of_study to reset branch when it changes
//   const fieldOfStudy = watch('field_of_study');
  
//   useEffect(() => {
//     if (fieldOfStudy !== student.field_of_study) {
//       setValue('branch', '');
//     }
//   }, [fieldOfStudy, student.field_of_study, setValue]);
  
//   // Check if there are any actual changes in the data
//   useEffect(() => {
//     // Filter out roll_no since it's read-only
//     const { roll_no, ...currentValues } = formValues;
//     const { roll_no: origRoll, ...originalValues } = defaultValues;
    
//     setHasChanges(!isEqual(currentValues, originalValues));
//   }, [formValues, defaultValues]);
  
//   const onSubmit = async (data: UpdateDetailsInput) => {
//     // If no changes, show message and return
//     if (!hasChanges) {
//       setSuccess('No changes detected in your data.');
//       setTimeout(() => {
//         setSuccess(null);
//       }, 3000);
//       return;
//     }
    
//     setLoading(true);
//     setError(null);
//     setSuccess(null);
    
//     try {
//       const updatedData = await updateStudentData(student.roll_no, data);
      
//       // Check if mobile number was changed
//       const mobileChanged = data.mobile_number !== student.mobile_number;
      
//       student.setStudentData({
//         ...updatedData,
//         is_data_verified: false,
//         is_mobile_verified: !mobileChanged && student.is_mobile_verified
//       });
      
//       setSuccess('Your details have been updated successfully.');
      
//       // Give user time to see success message before continuing
//       setTimeout(() => {
//         onUpdate();
//       }, 1500);
//     } catch (err: any) {
//       console.error('Failed to update data:', err);
//       setError(err.response?.data?.error || 'Update failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <Card className="shadow-none border-none">
//       <CardContent className="p-0">
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="roll_no">Roll No</Label>
//               <Input
//                 id="roll_no"
//                 {...register('roll_no')}
//                 readOnly
//                 className="bg-gray-50"
//               />
//               {errors.roll_no && (
//                 <p className="text-sm text-red-500">{errors.roll_no.message}</p>
//               )}
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="name">Name</Label>
//               <Input
//                 id="name"
//                 {...register('name')}
//               />
//               {errors.name && (
//                 <p className="text-sm text-red-500">{errors.name.message}</p>
//               )}
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 {...register('email')}
//               />
//               {errors.email && (
//                 <p className="text-sm text-red-500">{errors.email.message}</p>
//               )}
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="mobile_number">Mobile Number</Label>
//               <Input
//                 id="mobile_number"
//                 type="tel"
//                 {...register('mobile_number')}
//               />
//               {errors.mobile_number && (
//                 <p className="text-sm text-red-500">{errors.mobile_number.message}</p>
//               )}
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="date_of_birth">Date of Birth</Label>
//               <Input
//                 id="date_of_birth"
//                 type="date"
//                 {...register('date_of_birth')}
//               />
//               {errors.date_of_birth && (
//                 <p className="text-sm text-red-500">{errors.date_of_birth.message}</p>
//               )}
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="father_mobile_number">Father's Mobile Number</Label>
//               <Input
//                 id="father_mobile_number"
//                 type="tel"
//                 {...register('father_mobile_number')}
//               />
//               {errors.father_mobile_number && (
//                 <p className="text-sm text-red-500">{errors.father_mobile_number.message}</p>
//               )}
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="field_of_study">Field of Study</Label>
//               <Controller
//                 name="field_of_study"
//                 control={control}
//                 render={({ field }) => (
//                   <Select 
//                     value={field.value} 
//                     onValueChange={field.onChange}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select field of study" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {FIELD_OPTIONS.map((fieldOption) => (
//                         <SelectItem key={fieldOption} value={fieldOption}>
//                           {fieldOption}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.field_of_study && (
//                 <p className="text-sm text-red-500">{errors.field_of_study.message}</p>
//               )}
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="branch">Branch</Label>
//               <Controller
//                 name="branch"
//                 control={control}
//                 render={({ field }) => (
//                   <Select 
//                     value={field.value} 
//                     onValueChange={field.onChange}
//                     disabled={!fieldOfStudy}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder={fieldOfStudy ? "Select branch" : "Select field of study first"} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {fieldOfStudy && 
//                         BRANCH_OPTIONS[fieldOfStudy]?.map((branch) => (
//                           <SelectItem key={branch} value={branch}>
//                             {branch}
//                           </SelectItem>
//                         ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.branch && (
//                 <p className="text-sm text-red-500">{errors.branch.message}</p>
//               )}
//             </div>
            
//             <div className="space-y-2 md:col-span-2">
//               <Label htmlFor="address">Address</Label>
//               <Textarea
//                 id="address"
//                 {...register('address')}
//                 rows={3}
//               />
//               {errors.address && (
//                 <p className="text-sm text-red-500">{errors.address.message}</p>
//               )}
//             </div>
//           </div>
          
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
          
//           {success && (
//             <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
//               <CheckCircle2 className="h-4 w-4 text-green-600" />
//               <AlertDescription>{success}</AlertDescription>
//             </Alert>
//           )}
          
//           <div className="flex justify-end space-x-2">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={onCancel}
//               disabled={loading}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={loading || (!hasChanges && isDirty)}
//             >
//               {loading ? 'Saving...' : !hasChanges ? 'No Changes' : 'Save Changes'}
//             </Button>
//           </div>
//         </form>
//       </CardContent>
//     </Card>
//   );
// };

// export default UpdateDetailsForm;



// // // src/components/UpdateDetailsForm.tsx
// // import React, { useState } from 'react';
// // import { useStudentStore } from '../store/studentStore';
// // import { updateStudentData } from '../services/api';
// // import { Card, CardContent } from './ui/card';
// // import { Input } from './ui/input';
// // import { Button } from './ui/button';
// // import { Label } from './ui/label';
// // import { Textarea } from './ui/textarea';
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from './ui/select';
// // import { Alert, AlertDescription } from './ui/alert';
// // import { AlertCircle, CheckCircle2 } from 'lucide-react';

// // // Field of study options
// // const FIELD_OPTIONS = [
// //   "Engineering",
// //   "Medicine",
// //   "Arts",
// //   "Science",
// //   "Commerce",
// //   "Law"
// // ];

// // // Branch options based on field of study
// // const BRANCH_OPTIONS: Record<string, string[]> = {
// //   "Engineering": ["Computer Science", "Mechanical", "Electrical", "Civil", "Electronics", "Chemical"],
// //   "Medicine": ["MBBS", "BDS", "Pharmacy", "Nursing", "Physiotherapy"],
// //   "Arts": ["History", "Geography", "Political Science", "Economics", "Psychology", "Sociology"],
// //   "Science": ["Physics", "Chemistry", "Biology", "Mathematics", "Statistics"],
// //   "Commerce": ["Accounting", "Finance", "Marketing", "Human Resources", "Business Administration"],
// //   "Law": ["Civil Law", "Criminal Law", "Corporate Law", "International Law", "Family Law"]
// // };

// // interface UpdateDetailsFormProps {
// //   onCancel: () => void;
// //   onUpdate: () => void;
// // }

// // const UpdateDetailsForm: React.FC<UpdateDetailsFormProps> = ({ onCancel, onUpdate }) => {
// //   const student = useStudentStore();
  
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [success, setSuccess] = useState<string | null>(null);
  
// //   const [formData, setFormData] = useState({
// //     roll_no: student.roll_no || '',
// //     name: student.name || '',
// //     email: student.email || '',
// //     mobile_number: student.mobile_number || '',
// //     father_mobile_number: student.father_mobile_number || '',
// //     date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
// //     address: student.address || '',
// //     field_of_study: student.field_of_study || '',
// //     branch: student.branch || '',
// //   });
  
// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
// //     setFormData({
// //       ...formData,
// //       [e.target.name]: e.target.value
// //     });
// //   };
  
// //   const handleSelectFieldChange = (value: string) => {
// //     setFormData({
// //       ...formData,
// //       field_of_study: value,
// //       // Reset branch if changing field of study
// //       branch: ''
// //     });
// //   };
  
// //   const handleSelectBranchChange = (value: string) => {
// //     setFormData({
// //       ...formData,
// //       branch: value
// //     });
// //   };
  
// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError(null);
// //     setSuccess(null);
    
// //     try {
// //       const updatedData = await updateStudentData(student.roll_no, formData);
      
// //       // Check if mobile number was changed
// //       const mobileChanged = formData.mobile_number !== student.mobile_number;
      
// //       student.setStudentData({
// //         ...updatedData,
// //         is_data_verified: false,
// //         is_mobile_verified: !mobileChanged && student.is_mobile_verified
// //       });
      
// //       setSuccess('Your details have been updated successfully.');
      
// //       // Give user time to see success message before continuing
// //       setTimeout(() => {
// //         onUpdate();
// //       }, 1500);
// //     } catch (err: any) {
// //       console.error('Failed to update data:', err);
// //       setError(err.response?.data?.error || 'Update failed. Please try again.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
  
// //   return (
// //     <Card className="shadow-none border-none">
// //       <CardContent className="p-0">
// //         <form onSubmit={handleSubmit} className="space-y-4">
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //             <div className="space-y-2">
// //               <Label htmlFor="roll_no">Roll No</Label>
// //               <Input
// //                 id="roll_no"
// //                 name="roll_no"
// //                 value={formData.roll_no}
// //                 onChange={handleChange}
// //                 required
// //                 readOnly
// //                 className="bg-gray-50"
// //               />
// //             </div>
            
// //             <div className="space-y-2">
// //               <Label htmlFor="name">Name</Label>
// //               <Input
// //                 id="name"
// //                 name="name"
// //                 value={formData.name}
// //                 onChange={handleChange}
// //                 required
// //               />
// //             </div>
            
// //             <div className="space-y-2">
// //               <Label htmlFor="email">Email</Label>
// //               <Input
// //                 id="email"
// //                 name="email"
// //                 type="email"
// //                 value={formData.email}
// //                 onChange={handleChange}
// //                 required
// //               />
// //             </div>
            
// //             <div className="space-y-2">
// //               <Label htmlFor="mobile_number">Mobile Number</Label>
// //               <Input
// //                 id="mobile_number"
// //                 name="mobile_number"
// //                 type="tel"
// //                 value={formData.mobile_number}
// //                 onChange={handleChange}
// //                 required
// //               />
// //             </div>
            
// //             <div className="space-y-2">
// //               <Label htmlFor="date_of_birth">Date of Birth</Label>
// //               <Input
// //                 id="date_of_birth"
// //                 name="date_of_birth"
// //                 type="date"
// //                 value={formData.date_of_birth}
// //                 onChange={handleChange}
// //                 required
// //               />
// //             </div>
            
// //             <div className="space-y-2">
// //               <Label htmlFor="father_mobile_number">Father's Mobile Number</Label>
// //               <Input
// //                 id="father_mobile_number"
// //                 name="father_mobile_number"
// //                 type="tel"
// //                 value={formData.father_mobile_number}
// //                 onChange={handleChange}
// //                 required
// //               />
// //             </div>
            
// //             <div className="space-y-2">
// //               <Label htmlFor="field_of_study">Field of Study</Label>
// //               <Select 
// //                 value={formData.field_of_study} 
// //                 onValueChange={handleSelectFieldChange}
// //               >
// //                 <SelectTrigger>
// //                   <SelectValue placeholder="Select field of study" />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   {FIELD_OPTIONS.map((field) => (
// //                     <SelectItem key={field} value={field}>
// //                       {field}
// //                     </SelectItem>
// //                   ))}
// //                 </SelectContent>
// //               </Select>
// //             </div>
            
// //             <div className="space-y-2">
// //               <Label htmlFor="branch">Branch</Label>
// //               <Select 
// //                 value={formData.branch} 
// //                 onValueChange={handleSelectBranchChange}
// //                 disabled={!formData.field_of_study}
// //               >
// //                 <SelectTrigger>
// //                   <SelectValue placeholder={formData.field_of_study ? "Select branch" : "Select field of study first"} />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   {formData.field_of_study && 
// //                     BRANCH_OPTIONS[formData.field_of_study]?.map((branch) => (
// //                       <SelectItem key={branch} value={branch}>
// //                         {branch}
// //                       </SelectItem>
// //                     ))}
// //                 </SelectContent>
// //               </Select>
// //             </div>
            
// //             <div className="space-y-2 md:col-span-2">
// //               <Label htmlFor="address">Address</Label>
// //               <Textarea
// //                 id="address"
// //                 name="address"
// //                 value={formData.address}
// //                 onChange={handleChange}
// //                 required
// //                 rows={3}
// //               />
// //             </div>
// //           </div>
          
// //           {error && (
// //             <Alert variant="destructive">
// //               <AlertCircle className="h-4 w-4" />
// //               <AlertDescription>{error}</AlertDescription>
// //             </Alert>
// //           )}
          
// //           {success && (
// //             <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
// //               <CheckCircle2 className="h-4 w-4 text-green-600" />
// //               <AlertDescription>{success}</AlertDescription>
// //             </Alert>
// //           )}
          
// //           <div className="flex justify-end space-x-2">
// //             <Button
// //               type="button"
// //               variant="outline"
// //               onClick={onCancel}
// //               disabled={loading}
// //             >
// //               Cancel
// //             </Button>
// //             <Button
// //               type="submit"
// //               disabled={loading}
// //             >
// //               {loading ? 'Saving...' : 'Save Changes'}
// //             </Button>
// //           </div>
// //         </form>
// //       </CardContent>
// //     </Card>
// //   );
// // };

// // export default UpdateDetailsForm;