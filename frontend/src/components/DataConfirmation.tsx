// src/components/DataConfirmation.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../store/studentStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle2, XCircle, UserCircle } from "lucide-react";
import OtpVerification from "./OtpVerification";

interface DataConfirmationProps {
  onUpdateNeeded: () => void;
}

const DataConfirmation: React.FC<DataConfirmationProps> = ({
  onUpdateNeeded,
}) => {
  const navigate = useNavigate();
  const student = useStudentStore();
  const [loading, setLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  const handleNoChanges = () => {
    setLoading(true);
    // Instead of directly navigating to thank-you page, show OTP verification
    setShowOtpVerification(true);
    setLoading(false);
  };

  const handleNeedChanges = () => {
    onUpdateNeeded();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card className="shadow-md border rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="text-xl text-blue-700">
          {showOtpVerification
            ? "OTP Verification"
            : "Confirm Your Information"}
        </CardTitle>
        <CardDescription className="text-blue-600/70">
          {showOtpVerification &&
            "Please review your details and let us know if you need to make any changes"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {showOtpVerification ? (
          <OtpVerification
            onVerificationComplete={() => {
              // After OTP verification is complete, navigate to thank you page
              navigate("/thank-you");
            }}
          />
        ) : (
          <>
            {/* Student Details Section */}
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-600" />
                Your Current Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded border">
                    <h4 className="text-sm font-medium text-gray-500">
                      Roll Number
                    </h4>
                    <p className="font-medium text-gray-800">
                      {student.roll_no || "-"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded border">
                    <h4 className="text-sm font-medium text-gray-500">
                      Full Name
                    </h4>
                    <p className="font-medium text-gray-800">
                      {student.name || "-"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded border">
                    <h4 className="text-sm font-medium text-gray-500">
                      Email Address
                    </h4>
                    <p className="font-medium text-gray-800 break-words">
                      {student.email || "-"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded border">
                    <h4 className="text-sm font-medium text-gray-500">
                      Mobile Number
                    </h4>
                    <p className="font-medium text-gray-800">
                      {student.mobile_number || "-"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded border">
                    <h4 className="text-sm font-medium text-gray-500">
                      Date of Birth
                    </h4>
                    <p className="font-medium text-gray-800">
                      {formatDate(student.date_of_birth)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded border">
                    <h4 className="text-sm font-medium text-gray-500">
                      Father's Mobile Number
                    </h4>
                    <p className="font-medium text-gray-800">
                      {student.father_mobile_number || "-"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded border">
                    <h4 className="text-sm font-medium text-gray-500">
                      Field of Study
                    </h4>
                    <p className="font-medium text-gray-800">
                      {student.field_of_study || "-"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded border">
                    <h4 className="text-sm font-medium text-gray-500">
                      Address
                    </h4>
                    <p className="font-medium text-gray-800">
                      {student.address || "-"}
                    </p>
                  </div>

                  <div className="space-y-3 md:col-span-1">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-gray-50 p-3 rounded border">
                        <h4 className="text-sm font-medium text-gray-500">
                          Taluka
                        </h4>
                        <p className="font-medium text-gray-800">
                          {student.taluka || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-1">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-gray-50 p-3 rounded border">
                        <h4 className="text-sm font-medium text-gray-500">
                          City
                        </h4>
                        <p className="font-medium text-gray-800">
                          {student.city || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded border">
                      <h4 className="text-sm font-medium text-gray-500">
                        District
                      </h4>
                      <p className="font-medium text-gray-800">
                        {student.district || "-"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded border">
                      <h4 className="text-sm font-medium text-gray-500">
                        Pincode
                      </h4>
                      <p className="font-medium text-gray-800">
                        {student.pincode || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Question */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="text-blue-800 text-center font-medium text-lg mb-2">
                Is there any modification needed in your data?
              </p>
              <p className="text-blue-700 text-center text-sm">
                Please verify all your personal and academic information before
                proceeding.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleNeedChanges}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="h-5 w-5" />
                Yes, I Need to Update
              </Button>

              <Button
                onClick={handleNoChanges}
                variant="outline"
                className="flex items-center justify-center gap-2 border-green-500 text-green-700 hover:bg-green-50"
                disabled={loading}
              >
                <XCircle className="h-5 w-5" />
                {loading ? "Processing..." : "No, All Data is Correct"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DataConfirmation;

// // src/components/DataConfirmation.tsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useStudentStore } from "../store/studentStore";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "./ui/card";
// import { Button } from "./ui/button";
// import { CheckCircle2, XCircle, UserCircle } from "lucide-react";

// interface DataConfirmationProps {
//   onUpdateNeeded: () => void;
// }

// const DataConfirmation: React.FC<DataConfirmationProps> = ({
//   onUpdateNeeded,
// }) => {
//   const navigate = useNavigate();
//   const student = useStudentStore();
//   const [loading, setLoading] = useState(false);

//   const handleNoChanges = () => {
//     setLoading(true);
//     // Navigate to thank you page
//     navigate("/thank-you");
//   };

//   const handleNeedChanges = () => {
//     onUpdateNeeded();
//   };

//   // Format date for display
//   const formatDate = (dateString: string) => {
//     if (!dateString) return "-";
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   return (
//     <Card className="shadow-md border rounded-lg overflow-hidden">
//       <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
//         <CardTitle className="text-xl text-blue-700">
//           Confirm Your Information
//         </CardTitle>
//         <CardDescription className="text-blue-600/70">
//           Please review your details and let us know if you need to make any
//           changes
//         </CardDescription>
//       </CardHeader>

//       <CardContent className="p-6 space-y-6">
//         {/* Student Details Section */}
//         <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
//           <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center gap-2">
//             <UserCircle className="h-5 w-5 text-blue-600" />
//             Your Current Information
//           </h3>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-3">
//               <div className="bg-gray-50 p-3 rounded border">
//                 <h4 className="text-sm font-medium text-gray-500">
//                   Roll Number
//                 </h4>
//                 <p className="font-medium text-gray-800">
//                   {student.roll_no || "-"}
//                 </p>
//               </div>

//               <div className="bg-gray-50 p-3 rounded border">
//                 <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
//                 <p className="font-medium text-gray-800">
//                   {student.name || "-"}
//                 </p>
//               </div>

//               <div className="bg-gray-50 p-3 rounded border">
//                 <h4 className="text-sm font-medium text-gray-500">
//                   Email Address
//                 </h4>
//                 <p className="font-medium text-gray-800 break-words">
//                   {student.email || "-"}
//                 </p>
//               </div>

//               <div className="bg-gray-50 p-3 rounded border">
//                 <h4 className="text-sm font-medium text-gray-500">
//                   Mobile Number
//                 </h4>
//                 <p className="font-medium text-gray-800">
//                   {student.mobile_number || "-"}
//                 </p>
//               </div>

//               <div className="bg-gray-50 p-3 rounded border">
//                 <h4 className="text-sm font-medium text-gray-500">
//                   Date of Birth
//                 </h4>
//                 <p className="font-medium text-gray-800">
//                   {formatDate(student.date_of_birth)}
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-3">
//               <div className="bg-gray-50 p-3 rounded border">
//                 <h4 className="text-sm font-medium text-gray-500">
//                   Father's Mobile Number
//                 </h4>
//                 <p className="font-medium text-gray-800">
//                   {student.father_mobile_number || "-"}
//                 </p>
//               </div>

//               <div className="bg-gray-50 p-3 rounded border">
//                 <h4 className="text-sm font-medium text-gray-500">
//                   Field of Study
//                 </h4>
//                 <p className="font-medium text-gray-800">
//                   {student.field_of_study || "-"}
//                 </p>
//               </div>

//               <div className="bg-gray-50 p-3 rounded border">
//                 <h4 className="text-sm font-medium text-gray-500">Address</h4>
//                 <p className="font-medium text-gray-800">
//                   {student.address || "-"}
//                 </p>
//               </div>

//               <div className="space-y-3 md:col-span-1">
//                 <div className="grid grid-cols-1 gap-3">
//                   <div className="bg-gray-50 p-3 rounded border">
//                     <h4 className="text-sm font-medium text-gray-500">
//                       Taluka
//                     </h4>
//                     <p className="font-medium text-gray-800">
//                       {student.taluka || "-"}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-3 md:col-span-1">
//                 <div className="grid grid-cols-1 gap-3">
//                   <div className="bg-gray-50 p-3 rounded border">
//                     <h4 className="text-sm font-medium text-gray-500">City</h4>
//                     <p className="font-medium text-gray-800">
//                       {student.city || "-"}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-3 md:col-span-2">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 <div className="bg-gray-50 p-3 rounded border">
//                   <h4 className="text-sm font-medium text-gray-500">
//                     District
//                   </h4>
//                   <p className="font-medium text-gray-800">
//                     {student.district || "-"}
//                   </p>
//                 </div>

//                 <div className="bg-gray-50 p-3 rounded border">
//                   <h4 className="text-sm font-medium text-gray-500">Pincode</h4>
//                   <p className="font-medium text-gray-800">
//                     {student.pincode || "-"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Confirmation Question */}
//         <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
//           <p className="text-blue-800 text-center font-medium text-lg mb-2">
//             Is there any modification needed in your data?
//           </p>
//           <p className="text-blue-700 text-center text-sm">
//             Please verify all your personal and academic information before
//             proceeding.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <Button
//             onClick={handleNeedChanges}
//             className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
//           >
//             <CheckCircle2 className="h-5 w-5" />
//             Yes, I Need to Update
//           </Button>

//           <Button
//             onClick={handleNoChanges}
//             variant="outline"
//             className="flex items-center justify-center gap-2 border-green-500 text-green-700 hover:bg-green-50"
//             disabled={loading}
//           >
//             <XCircle className="h-5 w-5" />
//             {loading ? "Processing..." : "No, All Data is Correct"}
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default DataConfirmation;
