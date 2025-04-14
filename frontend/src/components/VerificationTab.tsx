import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../store/studentStore';
import { verifyStudentData } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2, Info, CheckSquare, ArrowRight } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import OtpVerification from './OtpVerification';
import { z } from 'zod';

const VerificationTab = () => {
  const navigate = useNavigate();
  const student = useStudentStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [hasValidData, setHasValidData] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validation schema for comprehensive checks
  const validationSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long')
      .refine(name => name.trim().split(/\s+/).length >= 2, 'Name should contain at least two words'),
    email: z.string().email('Email must be a valid email address'),
    mobile_number: z.string()
      .refine(val => /^\+[1-9]\d{1,14}$/.test(val), 'Mobile number must include country code (e.g., +91...)'),
    father_mobile_number: z.string()
      .refine(val => /^\+[1-9]\d{1,14}$/.test(val), 'Father\'s mobile number must include country code (e.g., +91...)'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    address: z.string().min(10, 'Address should be detailed and complete'),
    field_of_study: z.string().min(1, 'Field of study is required'),
    branch: z.string().min(1, 'Branch is required'),
  });

  // Check if student data is complete and valid for verification
  useEffect(() => {
    const requiredFields = [
      'name', 
      'email', 
      'mobile_number', 
      'father_mobile_number', 
      'date_of_birth', 
      'address', 
      'field_of_study', 
      'branch'
    ];
    
    const missingFields = requiredFields.filter(field => {
      return !student[field as keyof typeof student];
    });
    
    setHasValidData(missingFields.length === 0);

    if (missingFields.length === 0) {
      // If all fields are present, validate their contents
      validateStudentData();
    } else {
      // If fields are missing, set those as validation errors
      setValidationErrors(missingFields.map(field => `${field.replace(/_/g, ' ')} is required`));
    }
  }, [student]);
  
  // Validate student data comprehensively
  const validateStudentData = () => {
    try {
      validationSchema.parse({
        name: student.name,
        email: student.email,
        mobile_number: student.mobile_number,
        father_mobile_number: student.father_mobile_number,
        date_of_birth: student.date_of_birth,
        address: student.address,
        field_of_study: student.field_of_study,
        branch: student.branch,
      });
      setValidationErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => err.message);
        setValidationErrors(errors);
        setHasValidData(false);
        return false;
      }
      return false;
    }
  };

  const redirectToUpdateTab = () => {
    // Use react-router's navigate to go to the current URL but with update tab active
    // You could also use a state management approach instead
    const currentPath = window.location.pathname;
    navigate(currentPath, { state: { activeTab: 'history' } });
  };
  
  const handleVerify = async () => {
    // Perform validation check first
    const isValid = validateStudentData();
    
    if (!isValid) {
      setError('Please update your information to meet all requirements before verification.');
      return;
    }
    
    if (!student.is_mobile_verified) {
      setShowOtpVerification(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await verifyStudentData(student.roll_no);
      student.setStudentData({ ...student, is_data_verified: true });
      setSuccess('Your data has been successfully verified!');
    } catch (err: any) {
      console.error('Failed to verify data:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-white border-b">
        <CardTitle className="text-xl">Data Verification</CardTitle>
        <CardDescription>
          Verify your personal and academic information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="mb-6 bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {(!hasValidData || validationErrors.length > 0) && (
          <Alert variant="default" className="mb-6 bg-yellow-50 text-yellow-800 border-yellow-200">
            <Info className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p>Please update the following information before verification:</p>
              <ul className="list-disc pl-5 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                onClick={redirectToUpdateTab}
              >
                Go to Update Details <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {showOtpVerification ? (
          <OtpVerification 
            onVerificationComplete={() => {
              setShowOtpVerification(false);
              student.setStudentData({ ...student, is_mobile_verified: true });
            }}
          />
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Verification Status</h3>
              <div className="flex items-center gap-2">
                {student.is_data_verified ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Data Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">
                    Verification Pending
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Current Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Roll Number</h4>
                    <p className="font-medium">{student.roll_no || '-'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                    <p className="font-medium">{student.name || '-'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email Address</h4>
                    <p className="font-medium">{student.email || '-'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Mobile Number</h4>
                    <p className="font-medium">{student.mobile_number || '-'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
                    <p className="font-medium">{formatDate(student.date_of_birth)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Father's Mobile Number</h4>
                    <p className="font-medium">{student.father_mobile_number || '-'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Field of Study</h4>
                    <p className="font-medium">{student.field_of_study || '-'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Branch</h4>
                    <p className="font-medium">{student.branch || '-'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Address</h4>
                    <p className="font-medium">{student.address || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="border p-4 rounded-md bg-blue-50">
                <div className="flex items-start space-x-3 mb-4">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800">Important Information</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      By verifying your data, you confirm that all the information provided is accurate and complete.
                      Once verified, some information cannot be changed without administrative approval.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-8">
                  <Checkbox 
                    id="consent" 
                    checked={consentChecked}
                    onCheckedChange={(checked) => {
                      setConsentChecked(checked === true);
                    }}
                  />
                  <Label 
                    htmlFor="consent" 
                    className="text-sm font-medium text-blue-700 leading-none"
                  >
                    I confirm that all information provided is accurate and complete
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
              <div>
                {(!hasValidData || validationErrors.length > 0) && (
                  <p className="text-sm text-yellow-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Please update your information first
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                {!student.is_data_verified && (
                  <Button
                    variant="default"
                    onClick={handleVerify}
                    disabled={loading || !consentChecked || !hasValidData || validationErrors.length > 0}
                    className="flex items-center gap-2"
                  >
                    {loading ? 'Processing...' : 'Verify Data'}
                    {!loading && <CheckSquare className="h-4 w-4" />}
                  </Button>
                )}
                
                {student.is_data_verified && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Data Already Verified</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationTab;




// // src/components/VerificationTab.tsx
// import { useState, useEffect } from 'react';
// import { useStudentStore } from '../store/studentStore';
// import { verifyStudentData } from '../services/api';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Badge } from './ui/badge';
// import { Button } from './ui/button';
// import { Alert, AlertDescription } from './ui/alert';
// import { AlertCircle, CheckCircle2, Info, CheckSquare } from 'lucide-react';
// import { Checkbox } from './ui/checkbox';
// import { Label } from './ui/label';
// import OtpVerification from './OtpVerification';

// const VerificationTab = () => {
//   const student = useStudentStore();
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [showOtpVerification, setShowOtpVerification] = useState(false);
//   const [consentChecked, setConsentChecked] = useState(false);
//   const [hasValidData, setHasValidData] = useState(true);

//   // Check if student data is complete and valid for verification
//   useEffect(() => {
//     const requiredFields = [
//       'name', 
//       'email', 
//       'mobile_number', 
//       'father_mobile_number', 
//       'date_of_birth', 
//       'address', 
//       'field_of_study', 
//       'branch'
//     ];
    
//     const missingFields = requiredFields.filter(field => {
//       return !student[field as keyof typeof student];
//     });
    
//     setHasValidData(missingFields.length === 0);
//   }, [student]);
  
//   const handleVerify = async () => {
//     if (!student.is_mobile_verified) {
//       setShowOtpVerification(true);
//       return;
//     }
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       await verifyStudentData(student.roll_no);
//       student.setStudentData({ ...student, is_data_verified: true });
//       setSuccess('Your data has been successfully verified!');
//     } catch (err: any) {
//       console.error('Failed to verify data:', err);
//       setError('Verification failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Format date for display
//   const formatDate = (dateString: string) => {
//     if (!dateString) return '-';
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };
  
//   return (
//     <Card className="overflow-hidden">
//       <CardHeader className="bg-white border-b">
//         <CardTitle className="text-xl">Data Verification</CardTitle>
//         <CardDescription>
//           Verify your personal and academic information
//         </CardDescription>
//       </CardHeader>
      
//       <CardContent className="p-6">
//         {error && (
//           <Alert variant="destructive" className="mb-6">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}
        
//         {success && (
//           <Alert variant="default" className="mb-6 bg-green-50 text-green-800 border-green-200">
//             <CheckCircle2 className="h-4 w-4 text-green-600" />
//             <AlertDescription>{success}</AlertDescription>
//           </Alert>
//         )}
        
//         {!hasValidData && (
//           <Alert variant="default" className="mb-6 bg-yellow-50 text-yellow-800 border-yellow-200">
//             <Info className="h-4 w-4" />
//             <AlertDescription>
//               Some required information is missing or incomplete. Please update your details before verification.
//             </AlertDescription>
//           </Alert>
//         )}
        
//         {showOtpVerification ? (
//           <OtpVerification 
//             onVerificationComplete={() => {
//               setShowOtpVerification(false);
//               student.setStudentData({ ...student, is_mobile_verified: true });
//             }}
//           />
//         ) : (
//           <>
//             <div className="mb-6">
//               <h3 className="text-lg font-medium mb-2">Verification Status</h3>
//               <div className="flex items-center gap-2">
//                 {student.is_data_verified ? (
//                   <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
//                     Data Verified
//                   </Badge>
//                 ) : (
//                   <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">
//                     Verification Pending
//                   </Badge>
//                 )}
//               </div>
//             </div>
            
//             <div className="mb-6">
//               <h3 className="text-lg font-medium mb-4">Current Information</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md">
//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500">Roll Number</h4>
//                     <p className="font-medium">{student.roll_no || '-'}</p>
//                   </div>
                  
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
//                     <p className="font-medium">{student.name || '-'}</p>
//                   </div>
                  
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500">Email Address</h4>
//                     <p className="font-medium">{student.email || '-'}</p>
//                   </div>
                  
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500">Mobile Number</h4>
//                     <p className="font-medium">{student.mobile_number || '-'}</p>
//                   </div>
                  
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
//                     <p className="font-medium">{formatDate(student.date_of_birth)}</p>
//                   </div>
//                 </div>
                
//                 <div className="space-y-4">
//                   <div>
//                   // src/components/VerificationTab.tsx (continued)
//                     <h4 className="text-sm font-medium text-gray-500">Father's Mobile Number</h4>
//                     <p className="font-medium">{student.father_mobile_number || '-'}</p>
//                   </div>
                  
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500">Field of Study</h4>
//                     <p className="font-medium">{student.field_of_study || '-'}</p>
//                   </div>
                  
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500">Branch</h4>
//                     <p className="font-medium">{student.branch || '-'}</p>
//                   </div>
                  
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500">Address</h4>
//                     <p className="font-medium">{student.address || '-'}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="mb-6">
//               <div className="border p-4 rounded-md bg-blue-50">
//                 <div className="flex items-start space-x-3 mb-4">
//                   <Info className="h-5 w-5 text-blue-600 mt-0.5" />
//                   <div>
//                     <h3 className="font-medium text-blue-800">Important Information</h3>
//                     <p className="text-sm text-blue-700 mt-1">
//                       By verifying your data, you confirm that all the information provided is accurate and complete.
//                       Once verified, some information cannot be changed without administrative approval.
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center space-x-2 ml-8">
//                   <Checkbox 
//                     id="consent" 
//                     checked={consentChecked}
//                     onCheckedChange={(checked) => {
//                       setConsentChecked(checked === true);
//                     }}
//                   />
//                   <Label 
//                     htmlFor="consent" 
//                     className="text-sm font-medium text-blue-700 leading-none"
//                   >
//                     I confirm that all information provided is accurate and complete
//                   </Label>
//                 </div>
//               </div>
//             </div>
            
//             <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
//               <div>
//                 {!hasValidData && (
//                   <p className="text-sm text-yellow-600 flex items-center gap-1">
//                     <AlertCircle className="h-4 w-4" />
//                     Please update your incomplete information first
//                   </p>
//                 )}
//               </div>
              
//               <div className="flex gap-2">
//                 {!student.is_data_verified && (
//                   <Button
//                     variant="default"
//                     onClick={handleVerify}
//                     disabled={loading || !consentChecked || !hasValidData}
//                     className="flex items-center gap-2"
//                   >
//                     {loading ? 'Processing...' : 'Verify Data'}
//                     {!loading && <CheckSquare className="h-4 w-4" />}
//                   </Button>
//                 )}
                
//                 {student.is_data_verified && (
//                   <div className="flex items-center gap-2 text-green-600">
//                     <CheckCircle2 className="h-5 w-5" />
//                     <span className="font-medium">Data Already Verified</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default VerificationTab;