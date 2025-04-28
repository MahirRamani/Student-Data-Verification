// src/components/OtpVerification.tsx
import { useState, useEffect } from "react";
import { useStudentStore } from "../store/studentStore";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./ui/input-otp";
import { otpVerificationSchema } from "../validation/schemas";
import { z } from "zod";
import { updateStudentData } from "@/services/api";

interface OtpVerificationProps {
  onVerificationComplete: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({
  onVerificationComplete,
}) => {
  const student = useStudentStore();
  const navigate = useNavigate();

  const [otp, setOTP] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Firebase authentication related states
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  // Initialize recaptchaVerifier
  useEffect(() => {
    // Initialize recaptchaVerifier only if it doesn't exist
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });

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
      setError(
        "Recaptcha verifier not initialized. Please refresh the page and try again."
      );
      setLoading(false);
      return;
    }

    try {
      // Validate mobile number with Zod
      const validatedInput = otpVerificationSchema
        .pick({ mobile_number: true })
        .parse({ mobile_number: student.mobile_number });

      // Format the phone number to include + if it doesn't already
      const formattedPhoneNumber = validatedInput.mobile_number.startsWith("+")
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
      setSuccess("OTP sent successfully to your mobile number.");
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setResendCountdown(0);

      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err.code === "auth/invalid-phone-number") {
        setError(
          "Invalid phone number. Please check the format (include country code)."
        );
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else {
        setError(err.message || "Failed to send OTP. Please try again.");
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
        setError("Please request an OTP first.");
        return;
      }

      setVerifying(true);
      setError(null);

      // Use Firebase confirmation
      await confirmationResult.confirm(otp);
      console.log("OTP verified successfully", confirmationResult.confirm(otp));

      setSuccess("Mobile number verified successfully!");
      student.setStudentData({
        is_mobile_verified: true,
        is_data_verified: true,
      });

      updateStudentData(student.roll_no, student);
      onVerificationComplete();
      // Then redirect to ThankYou page after a short delay
      setTimeout(() => {
        navigate('/thankyou');
      }, 1500);
    } catch (err: any) {
      console.error("Error verifying OTP:", err);

      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="shadow-md border rounded-lg bg-white">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl font-bold text-center sm:text-left">
          Mobile Verification
        </CardTitle>
        <CardDescription className="text-center sm:text-left">
          Verify your mobile number {student.mobile_number} to complete the
          process.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-6">
        {!otpSent ? (
          <div className="space-y-4">
            <Button
              onClick={handleSendOTP}
              disabled={loading || !recaptchaVerifier}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Enter the 6-digit OTP sent to {student.mobile_number}
              </p>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOTP(value)}
                className="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="border-gray-300" />
                  <InputOTPSlot index={1} className="border-gray-300" />
                  <InputOTPSlot index={2} className="border-gray-300" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} className="border-gray-300" />
                  <InputOTPSlot index={4} className="border-gray-300" />
                  <InputOTPSlot index={5} className="border-gray-300" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || verifying}
                className="w-full bg-green-600 hover:bg-green-700 transition-colors"
              >
                {verifying ? "Verifying..." : "Verify OTP"}
              </Button>

              <Button
                variant="outline"
                disabled={resendCountdown > 0 || loading || !recaptchaVerifier}
                onClick={handleSendOTP}
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                {resendCountdown > 0
                  ? `Resend OTP in ${resendCountdown}s`
                  : loading
                  ? "Sending OTP..."
                  : "Resend OTP"}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <Alert
            variant="destructive"
            className="rounded-md border-red-200 bg-red-50"
          >
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert
            variant="default"
            className="rounded-md bg-green-50 text-green-800 border-green-200"
          >
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Required div for recaptcha to render */}
        <div id="recaptcha-container" className="flex justify-center"></div>
      </CardContent>
    </Card>
  );
};

export default OtpVerification;
