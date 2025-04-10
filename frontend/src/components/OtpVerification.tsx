// src/components/OtpVerification.tsx
import { useState, useEffect } from 'react';
import { useStudentStore } from '../store/studentStore';
import { auth } from '../services/firebase'; // Make sure to add this import
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth'; // Add these Firebase imports
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
      // Format the phone number to include + if it doesn't already
      const formattedPhoneNumber = student.mobile_number.startsWith('+') 
        ? student.mobile_number 
        : `+${student.mobile_number}`;
      
      // Use Firebase signInWithPhoneNumber instead of your custom requestOTP
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
      
      if (err.code === 'auth/invalid-phone-number') {
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
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }
    
    if (!confirmationResult) {
      setError('Please request an OTP first.');
      return;
    }
    
    setVerifying(true);
    setError(null);
    
    try {
      // Use Firebase confirmation instead of your custom verifyMobileOtp
      await confirmationResult.confirm(otp);
      setSuccess('Mobile number verified successfully!');
      student.setStudentData({ is_mobile_verified: true });
      
      setTimeout(() => {
        onVerificationComplete();
      }, 1500);
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError('Invalid OTP. Please try again.');
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




// // src/components/OtpVerification.tsx
// import { useState, useEffect } from 'react';
// import { useStudentStore } from '../store/studentStore';
// import { requestOTP, verifyMobileOtp } from '../services/api';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
// import { Button } from './ui/button';
// import { Alert, AlertDescription } from './ui/alert';
// import { AlertCircle, CheckCircle2 } from 'lucide-react';
// import {
//   InputOTP,
//   InputOTPGroup,
//   InputOTPSeparator,
//   InputOTPSlot,
// } from './ui/input-otp';

// interface OtpVerificationProps {
//   onVerificationComplete: () => void;
// }

// const OtpVerification: React.FC<OtpVerificationProps> = ({ 
//   onVerificationComplete 
// }) => {
//   const student = useStudentStore();
  
//   const [otp, setOTP] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [otpSent, setOtpSent] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [resendCountdown, setResendCountdown] = useState(0);
  
//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (resendCountdown > 0) {
//       timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [resendCountdown]);
  
//   const handleSendOTP = async () => {
//     setLoading(true);
//     setError(null);
//     setSuccess(null);
    
//     try {
//       await requestOTP(student.roll_no, student.mobile_number);
//       setOtpSent(true);
//       setResendCountdown(60);
//       setSuccess('OTP sent successfully to your mobile number.');
//     } catch (err: any) {
//       console.error('Error sending OTP:', err);
//       setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleVerifyOTP = async () => {
//     if (otp.length !== 6) {
//       setError('Please enter a valid 6-digit OTP.');
//       return;
//     }
    
//     setVerifying(true);
//     setError(null);
    
//     try {
//       await verifyMobileOtp(student.roll_no, otp);
//       setSuccess('Mobile number verified successfully!');
//       student.setStudentData({ is_mobile_verified: true });
//       setTimeout(() => {
//         onVerificationComplete();
//       }, 1500);
//     } catch (err: any) {
//       console.error('Error verifying OTP:', err);
//       setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
//     } finally {
//       setVerifying(false);
//     }
//   };
  
//   return (
//     <Card className="shadow-none border-none">
//       <CardHeader className="px-0">
//         <CardTitle>Mobile Verification</CardTitle>
//         <CardDescription>
//           Verify your mobile number {student.mobile_number} to complete the process.
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="px-0 space-y-6">
//         {!otpSent ? (
//           <div className="space-y-4">
//             <Button 
//               onClick={handleSendOTP} 
//               disabled={loading}
//               className="w-full"
//             >
//               {loading ? 'Sending OTP...' : 'Send OTP'}
//             </Button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to {student.mobile_number}</p>
//               <InputOTP 
//                 maxLength={6} 
//                 value={otp} 
//                 onChange={(value) => setOTP(value)}
//                 className="justify-center"
//               >
//                 <InputOTPGroup>
//                   <InputOTPSlot index={0} />
//                   <InputOTPSlot index={1} />
//                   <InputOTPSlot index={2} />
//                 </InputOTPGroup>
//                 <InputOTPSeparator />
//                 <InputOTPGroup>
//                   <InputOTPSlot index={3} />
//                   <InputOTPSlot index={4} />
//                   <InputOTPSlot index={5} />
//                 </InputOTPGroup>
//               </InputOTP>
//             </div>
            
//             <div className="flex flex-col space-y-2">
//               <Button 
//                 onClick={handleVerifyOTP} 
//                 disabled={otp.length !== 6 || verifying}
//                 className="w-full"
//               >
//                 {verifying ? 'Verifying...' : 'Verify OTP'}
//               </Button>
              
//               <Button 
//                 variant="outline" 
//                 disabled={resendCountdown > 0 || loading}
//                 onClick={handleSendOTP}
//                 className="w-full"
//               >
//                 {resendCountdown > 0 
//                   ? `Resend OTP in ${resendCountdown}s` 
//                   : loading ? 'Sending OTP...' : 'Resend OTP'}
//               </Button>
//             </div>
//           </div>
//         )}
        
//         {error && (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}
        
//         {success && (
//           <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
//             <CheckCircle2 className="h-4 w-4 text-green-600" />
//             <AlertDescription>{success}</AlertDescription>
//           </Alert>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default OtpVerification;