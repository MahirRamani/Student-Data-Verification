import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../store/studentStore";
import { verifyStudentData } from "../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import OtpVerification from "./OtpVerification";
import { z } from "zod";

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
    name: z
      .string()
      .min(1, "Name is required")
      .refine((value) => value.trim().split(/\s+/).length == 3, {
        message: "Name must contain at least three words",
      }),
    email: z.string().email("Email must be a valid email address"),
    mobile_number: z
      .string()
      .refine(
        (val) => /^\+[1-9]\d{1,14}$/.test(val),
        "Mobile number must include country code (e.g., +91...)"
      ),
    father_mobile_number: z
      .string()
      .refine(
        (val) => /^\+[1-9]\d{1,14}$/.test(val),
        "Father's mobile number must include country code (e.g., +91...)"
      ),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    address: z.string().min(10, "Address should be detailed and complete"),
    field_of_study: z.string().min(1, "Field of study is required"),
  });

  // Check if student data is complete and valid for verification
  useEffect(() => {
    const requiredFields = [
      "name",
      "email",
      "mobile_number",
      "father_mobile_number",
      "date_of_birth",
      "address",
      "field_of_study",
      "taluka",
      "district",
      "pincode",
    ];

    const missingFields = requiredFields.filter((field) => {
      return !student[field as keyof typeof student];
    });

    setHasValidData(missingFields.length === 0);

    if (missingFields.length === 0) {
      // If all fields are present, validate their contents
      validateStudentData();
    } else {
      // If fields are missing, set those as validation errors
      setValidationErrors(
        missingFields.map((field) => `${field.replace(/_/g, " ")} is required`)
      );
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
      });
      setValidationErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => err.message);
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
    navigate(currentPath, { state: { activeTab: "update" } });
  };

  const handleVerify = async () => {
    // Perform validation check first
    const isValid = validateStudentData();

    if (!isValid) {
      setError(
        "Please update your information to meet all requirements before verification."
      );
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
      setSuccess("Your data has been successfully verified!");
    } catch (err: any) {
      console.error("Failed to verify data:", err);
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-md border rounded-lg hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-blue-700">
              Data Verification
            </CardTitle>
            <CardDescription className="text-blue-600/70">
              Verify your personal and academic information
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        {error && (
          <Alert variant="destructive" className="mb-6 animate-fadeIn">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert
            variant="default"
            className="mb-6 bg-green-50 text-green-800 border-green-200 animate-fadeIn"
          >
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {(!hasValidData || validationErrors.length > 0) && (
          <Alert
            variant="default"
            className="mb-6 bg-yellow-50 text-yellow-800 border-yellow-200 animate-fadeIn"
          >
            <Info className="h-4 w-4 flex-shrink-0" />
            <AlertDescription className="space-y-2">
              <p>
                Please update the following information before verification:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="mt-3 border-yellow-300 text-yellow-800 hover:bg-yellow-100 w-full sm:w-auto"
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
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-700">
                <Badge
                  variant={student.is_data_verified ? "default" : "outline"}
                  className={
                    student.is_data_verified
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-yellow-50 text-yellow-800 hover:bg-yellow-50"
                  }
                >
                  {student.is_data_verified ? "Verified" : "Pending"}
                </Badge>
                Verification Status
              </h3>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-blue-600" />
                  Current Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border">
                      <h4 className="text-sm font-medium text-gray-500">
                        Roll Number
                      </h4>
                      <p className="font-medium text-gray-800">
                        {student.roll_no || "-"}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <h4 className="text-sm font-medium text-gray-500">
                        Full Name
                      </h4>
                      <p className="font-medium text-gray-800">
                        {student.name || "-"}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <h4 className="text-sm font-medium text-gray-500">
                        Email Address
                      </h4>
                      <p className="font-medium text-gray-800 break-words">
                        {student.email || "-"}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <h4 className="text-sm font-medium text-gray-500">
                        Mobile Number
                      </h4>
                      <p className="font-medium text-gray-800">
                        {student.mobile_number || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border">
                      <h4 className="text-sm font-medium text-gray-500">
                        Father's Mobile Number
                      </h4>
                      <p className="font-medium text-gray-800">
                        {student.father_mobile_number || "-"}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <h4 className="text-sm font-medium text-gray-500">
                        Field of Study
                      </h4>
                      <p className="font-medium text-gray-800">
                        {student.field_of_study || "-"}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <h4 className="text-sm font-medium text-gray-500">
                        Address
                      </h4>
                      <p className="font-medium text-gray-800">
                        {student.address || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="border p-4 rounded-lg bg-blue-50 shadow-sm">
                <div className="flex items-start space-x-3 mb-4">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800">
                      Important Information
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      By verifying your data, you confirm that all the
                      information provided is accurate and complete. Once
                      verified, some information cannot be changed without
                      administrative approval.
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
                    className="text-blue-600 border-blue-400 data-[state=checked]:bg-blue-600"
                  />
                  <Label
                    htmlFor="consent"
                    className="text-sm font-medium text-blue-700 leading-none cursor-pointer"
                  >
                    I confirm that all information provided is accurate and
                    complete
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div>
                {(!hasValidData || validationErrors.length > 0) && (
                  <p className="text-sm text-yellow-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Please update your information first
                  </p>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {!student.is_data_verified && (
                  <Button
                    variant="default"
                    onClick={handleVerify}
                    disabled={
                      loading ||
                      !consentChecked ||
                      !hasValidData ||
                      validationErrors.length > 0
                    }
                    className="flex items-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Processing..." : "Verify Data"}
                    {!loading && <CheckSquare className="h-4 w-4" />}
                  </Button>
                )}

                {student.is_data_verified && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-md border border-green-200">
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
