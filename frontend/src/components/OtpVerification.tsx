// // src/components/OtpVerification.tsx
// import { useState, useEffect } from 'react';
// import { useStudentStore } from '../store/studentStore';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Alert, AlertDescription } from './ui/alert';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { AlertCircle, CheckCircle2, PhoneCall } from 'lucide-react';

// interface OtpVerificationProps {
//   onVerificationComplete: () => void;
// }

// const OtpVerification: React.FC<OtpVerificationProps> = ({ onVerificationComplete }) => {
//   const student = useStudentStore();
  
//   const [otp, setOtp] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [requestingOtp, setRequestingOtp] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [timer, setTimer] = useState(0);
  
//   // Simulate OTP request
//   const requestOtp = async () => {
//     setRequestingOtp(true);
//     setError(null);
    
//     try {
//       // In a real implementation, call API to request OTP
//       // await requestOtp(student.roll_no, student.mobile_number);
      
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       setSuccess(`OTP sent to ${student.mobile_number}`);
//       setTimer(30); // Start 30 second countdown
//     } catch (err: any) {
//       console.error('Failed to request OTP:', err);
//       setError('Failed to send OTP. Please try again.');
//     } finally {
//       setRequestingOtp(false);
//     }
//   };
  
//   // Simulate OTP verification
//   const verifyOtp = async () => {
//     if (!otp || otp.length !== 6) {
//       setError('Please enter a valid 6-digit OTP');
//       return;
//     }
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       // In a real implementation, call API to verify OTP
//       // await verifyMobileOtp(student.roll_no, otp);
      
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       // For demo purposes, accept any 6-digit code
//       if (otp.length === 6 && /^\d+$/.test(otp)) {
//         setSuccess('Mobile number verified successfully!');
        
//         // Wait a moment before completing verification flow
//         setTimeout(() => {
//           onVerificationComplete();
//         }, 1500);
//       } else {
//         setError('Invalid OTP. Please try again.');
//       }
//     } catch (err: any) {
//       console.error('Failed to verify OTP:', err);
//       setError('OTP verification failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Set up timer countdown
//   useEffect(() => {
//     let interval: ReturnType<typeof setInterval>;
    
//     if (timer > 0) {
//       interval = setInterval(() => {
//         setTimer(prev => prev - 1);
//       }, 1000);
//     }
    
//     return () => clearInterval(interval);
//   }, [timer]);
  
//   // Request OTP automatically on component mount
//   useEffect(() => {
//     requestOtp();
//   }, []);
  
//   return (
//     <div className="max-w-md mx-auto">
//       <Card>
//         <CardHeader>
//           <CardTitle>Mobile Verification</CardTitle>
//           <CardDescription>
//             Enter the OTP sent to your mobile number {student.mobile_number}
//           </CardDescription>
//         </CardHeader>
        
//         <CardContent className="space-y-4">
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
          
//           <div className="space-y-2">
//             <Input
//               placeholder="Enter 6-digit OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
//               disabled={loading}
//               className="text-center text-lg tracking-widest"
//             />
            
//             <div className="flex justify-between items-center">
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={requestOtp}
//                 disabled={requestingOtp || timer > 0 || loading}
//                 className="text-sm"
//               >
//                 <PhoneCall className="h-3 w-3 mr-1" />
//                 {requestingOtp ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
//               </Button>
              
//               <Button
//                 onClick={verifyOtp}
//                 disabled={loading || otp.length !== 6}
//               >
//                 {loading ? 'Verifying...' : 'Verify'}
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default OtpVerification;




// src/components/OtpVerification.tsx
import { useState, useEffect } from 'react';
import { useStudentStore } from '../store/studentStore';
import { auth } from '../services/firebase';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from './ui/input-otp';
import { otpVerificationSchema } from '../validation/schemas';
import { z } from 'zod';
import { updateStudentData } from '@/services/api';

interface OtpVerificationProps {
  onVerificationComplete: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ 
  onVerificationComplete 
}) => {
  const student = useStudentStore();
  
  const [otp, setOTP] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  // Firebase authentication related states
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // Initialize recaptchaVerifier
  useEffect(() => {
    // Initialize recaptchaVerifier only if it doesn't exist
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
        }
      );
      
      setRecaptchaVerifier(verifier);
      
      // Clean up on component unmount
      return () => {
        verifier.clear();
      };
    }
  }, []);
  
  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);
  
  // Auto-verify when all digits are entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOTP();
    }
  }, [otp]);
  
  const handleSendOTP = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    if (!recaptchaVerifier) {
      setError('Recaptcha verifier not initialized. Please refresh the page and try again.');
      setLoading(false);
      return;
    }
    
    try {
      // Validate mobile number with Zod
      const validatedInput = otpVerificationSchema.pick({ mobile_number: true })
        .parse({ mobile_number: student.mobile_number });
      
      // Format the phone number to include + if it doesn't already
      const formattedPhoneNumber = validatedInput.mobile_number.startsWith('+') 
        ? validatedInput.mobile_number 
        : `+${validatedInput.mobile_number}`;
      
      // Use Firebase signInWithPhoneNumber
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        recaptchaVerifier
      );
      
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setResendCountdown(60);
      setSuccess('OTP sent successfully to your mobile number.');
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setResendCountdown(0);
      
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Please check the format (include country code).');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOTP = async () => {
    try {
      // Validate OTP with Zod
      otpVerificationSchema.pick({ otp: true }).parse({ otp });
      console.log(otp);
      
      if (!confirmationResult) {
        setError('Please request an OTP first.');
        return;
      }
      
      setVerifying(true);
      setError(null);
      
      // Use Firebase confirmation
      await confirmationResult.confirm(otp);
      console.log("OTP verified successfully",confirmationResult.confirm(otp));
      
      setSuccess('Mobile number verified successfully!');
      student.setStudentData({ is_mobile_verified: true, is_data_verified: true });
      
      updateStudentData(student.roll_no, student);
      setTimeout(() => {
        onVerificationComplete();
      }, 1500);
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } finally {
      setVerifying(false);
    }
  };
  
  return (
    <Card className="shadow-none border-none">
      <CardHeader className="px-0">
        <CardTitle>Mobile Verification</CardTitle>
        <CardDescription>
          Verify your mobile number {student.mobile_number} to complete the process.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {!otpSent ? (
          <div className="space-y-4">
            <Button 
              onClick={handleSendOTP} 
              disabled={loading || !recaptchaVerifier}
              className="w-full"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to {student.mobile_number}</p>
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={(value) => setOTP(value)}
                className="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={handleVerifyOTP} 
                disabled={otp.length !== 6 || verifying}
                className="w-full"
              >
                {verifying ? 'Verifying...' : 'Verify OTP'}
              </Button>
              
              <Button 
                variant="outline" 
                disabled={resendCountdown > 0 || loading || !recaptchaVerifier}
                onClick={handleSendOTP}
                className="w-full"
              >
                {resendCountdown > 0 
                  ? `Resend OTP in ${resendCountdown}s` 
                  : loading ? 'Sending OTP...' : 'Resend OTP'}
              </Button>
            </div>
          </div>
        )}
        
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
        
        {/* Required div for recaptcha to render */}
        <div id="recaptcha-container"></div>
      </CardContent>
    </Card>
  );
};

export default OtpVerification;



//   // // src/components/OtpVerification.tsx
// // import { useState, useEffect } from 'react';
// // import { useStudentStore } from '../store/studentStore';
// // import { auth } from '../services/firebase'; // Make sure to add this import
// // import {
// //   ConfirmationResult,
// //   RecaptchaVerifier,
// //   signInWithPhoneNumber,
// // } from 'firebase/auth'; // Add these Firebase imports
// // import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
// // import { Button } from './ui/button';
// // import { Alert, AlertDescription } from './ui/alert';
// // import { AlertCircle, CheckCircle2 } from 'lucide-react';
// // import {
// //   InputOTP,
// //   InputOTPGroup,
// //   InputOTPSeparator,
// //   InputOTPSlot,
// // } from './ui/input-otp';

// // interface OtpVerificationProps {
// //   onVerificationComplete: () => void;
// // }

// // const OtpVerification: React.FC<OtpVerificationProps> = ({ 
// //   onVerificationComplete 
// // }) => {
// //   const student = useStudentStore();
  
// //   const [otp, setOTP] = useState('');
// //   const [error, setError] = useState<string | null>(null);
// //   const [success, setSuccess] = useState<string | null>(null);
// //   const [otpSent, setOtpSent] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [verifying, setVerifying] = useState(false);
// //   const [resendCountdown, setResendCountdown] = useState(0);
  
// //   // Firebase authentication related states
// //   const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
// //   const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
// //   // Initialize recaptchaVerifier
// //   useEffect(() => {
// //     // Initialize recaptchaVerifier only if it doesn't exist
// //     if (!recaptchaVerifier) {
// //       const verifier = new RecaptchaVerifier(
// //         auth,
// //         'recaptcha-container',
// //         {
// //           size: 'invisible',
// //         }
// //       );
      
// //       setRecaptchaVerifier(verifier);
      
// //       // Clean up on component unmount
// //       return () => {
// //         verifier.clear();
// //       };
// //     }
// //   }, []);
  
// //   // Countdown timer for resend OTP
// //   useEffect(() => {
// //     let timer: NodeJS.Timeout;
// //     if (resendCountdown > 0) {
// //       timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
// //       return () => clearTimeout(timer);
// //     }
// //   }, [resendCountdown]);
  
// //   // Auto-verify when all digits are entered
// //   useEffect(() => {
// //     if (otp.length === 6) {
// //       handleVerifyOTP();
// //     }
// //   }, [otp]);
  
// //   const handleSendOTP = async () => {
// //     setLoading(true);
// //     setError(null);
// //     setSuccess(null);
    
// //     if (!recaptchaVerifier) {
// //       setError('Recaptcha verifier not initialized. Please refresh the page and try again.');
// //       setLoading(false);
// //       return;
// //     }
    
// //     try {
// //       // Format the phone number to include + if it doesn't already
// //       const formattedPhoneNumber = student.mobile_number.startsWith('+') 
// //         ? student.mobile_number 
// //         : `+${student.mobile_number}`;
      
// //       // Use Firebase signInWithPhoneNumber instead of your custom requestOTP
// //       const confirmation = await signInWithPhoneNumber(
// //         auth,
// //         formattedPhoneNumber,
// //         recaptchaVerifier
// //       );
      
// //       setConfirmationResult(confirmation);
// //       setOtpSent(true);
// //       setResendCountdown(60);
// //       setSuccess('OTP sent successfully to your mobile number.');
// //     } catch (err: any) {
// //       console.error('Error sending OTP:', err);
// //       setResendCountdown(0);
      
// //       if (err.code === 'auth/invalid-phone-number') {
// //         setError('Invalid phone number. Please check the format (include country code).');
// //       } else if (err.code === 'auth/too-many-requests') {
// //         setError('Too many requests. Please try again later.');
// //       } else {
// //         setError(err.message || 'Failed to send OTP. Please try again.');
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
  
// //   const handleVerifyOTP = async () => {
// //     if (otp.length !== 6) {
// //       setError('Please enter a valid 6-digit OTP.');
// //       return;
// //     }
    
// //     if (!confirmationResult) {
// //       setError('Please request an OTP first.');
// //       return;
// //     }
    
// //     setVerifying(true);
// //     setError(null);
    
// //     try {
// //       // Use Firebase confirmation instead of your custom verifyMobileOtp
// //       await confirmationResult.confirm(otp);
// //       setSuccess('Mobile number verified successfully!');
// //       student.setStudentData({ is_mobile_verified: true });
      
// //       setTimeout(() => {
// //         onVerificationComplete();
// //       }, 1500);
// //     } catch (err: any) {
// //       console.error('Error verifying OTP:', err);
// //       setError('Invalid OTP. Please try again.');
// //     } finally {
// //       setVerifying(false);
// //     }
// //   };
  
// //   return (
// //     <Card className="shadow-none border-none">
// //       <CardHeader className="px-0">
// //         <CardTitle>Mobile Verification</CardTitle>
// //         <CardDescription>
// //           Verify your mobile number {student.mobile_number} to complete the process.
// //         </CardDescription>
// //       </CardHeader>
// //       <CardContent className="px-0 space-y-6">
// //         {!otpSent ? (
// //           <div className="space-y-4">
// //             <Button 
// //               onClick={handleSendOTP} 
// //               disabled={loading || !recaptchaVerifier}
// //               className="w-full"
// //             >
// //               {loading ? 'Sending OTP...' : 'Send OTP'}
// //             </Button>
// //           </div>
// //         ) : (
// //           <div className="space-y-4">
// //             <div className="space-y-2">
// //               <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to {student.mobile_number}</p>
// //               <InputOTP 
// //                 maxLength={6} 
// //                 value={otp} 
// //                 onChange={(value) => setOTP(value)}
// //                 className="justify-center"
// //               >
// //                 <InputOTPGroup>
// //                   <InputOTPSlot index={0} />
// //                   <InputOTPSlot index={1} />
// //                   <InputOTPSlot index={2} />
// //                 </InputOTPGroup>
// //                 <InputOTPSeparator />
// //                 <InputOTPGroup>
// //                   <InputOTPSlot index={3} />
// //                   <InputOTPSlot index={4} />
// //                   <InputOTPSlot index={5} />
// //                 </InputOTPGroup>
// //               </InputOTP>
// //             </div>
            
// //             <div className="flex flex-col space-y-2">
// //               <Button 
// //                 onClick={handleVerifyOTP} 
// //                 disabled={otp.length !== 6 || verifying}
// //                 className="w-full"
// //               >
// //                 {verifying ? 'Verifying...' : 'Verify OTP'}
// //               </Button>
              
// //               <Button 
// //                 variant="outline" 
// //                 disabled={resendCountdown > 0 || loading || !recaptchaVerifier}
// //                 onClick={handleSendOTP}
// //                 className="w-full"
// //               >
// //                 {resendCountdown > 0 
// //                   ? `Resend OTP in ${resendCountdown}s` 
// //                   : loading ? 'Sending OTP...' : 'Resend OTP'}
// //               </Button>
// //             </div>
// //           </div>
// //         )}
        
// //         {error && (
// //           <Alert variant="destructive">
// //             <AlertCircle className="h-4 w-4" />
// //             <AlertDescription>{error}</AlertDescription>
// //           </Alert>
// //         )}
        
// //         {success && (
// //           <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
// //             <CheckCircle2 className="h-4 w-4 text-green-600" />
// //             <AlertDescription>{success}</AlertDescription>
// //           </Alert>
// //         )}
        
// //         {/* Required div for recaptcha to render */}
// //         <div id="recaptcha-container"></div>
// //       </CardContent>
// //     </Card>
// //   );
// // };

// // export default OtpVerification;