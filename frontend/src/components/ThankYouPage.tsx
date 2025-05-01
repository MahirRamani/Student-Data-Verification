import { useState, useEffect } from "react";
import { useStudentStore } from "../store/studentStore";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle2 } from "lucide-react";

const ThankYouPage = () => {
  const student = useStudentStore();
  const [isAnimating, setIsAnimating] = useState(true);

  // Control the entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <Card className={`w-full max-w-md shadow-xl border border-gray-200 overflow-hidden ${isAnimating ? "animate-fade-in-up" : ""}`}>
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 text-center">
          <div className="mx-auto bg-white rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <CheckCircle2 className={`h-10 w-10 text-green-500 ${isAnimating ? "animate-success-check" : ""}`} />
          </div>
          <CardTitle className="text-2xl font-bold">Thank You!</CardTitle>
        </CardHeader>

        <CardContent className="p-6 text-center space-y-6">
          <div className="space-y-3">
            <p className="text-lg font-medium text-gray-800">
              Your information has been confirmed.
            </p>
            <p className="text-gray-600">
              Thank you for verifying your details.
            </p>
            
            {/* Show roll number */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md border">
              <p className="text-gray-500 text-sm">Your Roll Number</p>
              <p className="text-xl font-bold text-gray-800">{student.roll_no}</p>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={() => window.location.href = "/login"} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYouPage;

// Add these animations to your global CSS file:
/*

*/

// // src/components/ThankYouPage.tsx
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useStudentStore } from "../store/studentStore";
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { CheckCircle2 } from "lucide-react";

// const ThankYouPage = () => {
//   const navigate = useNavigate();
//   const student = useStudentStore();

//   // Auto logout after 10 seconds
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       handleLogout();
//     }, 10000);

//     return () => clearTimeout(timer);
//   }, []);

//   const handleLogout = () => {
//     student.logout();
//     navigate("/login");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
//       <Card className="w-full max-w-md shadow-xl border border-gray-200 overflow-hidden">
//         <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 text-center">
//           <div className="mx-auto bg-white rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
//             <CheckCircle2 className="h-10 w-10 text-green-500" />
//           </div>
//           <CardTitle className="text-2xl font-bold">Thank You!</CardTitle>
//         </CardHeader>

//         <CardContent className="p-6 text-center space-y-6">
//           <div className="space-y-3">
//             <p className="text-lg font-medium text-gray-800">
//               Your information has been confirmed.
//             </p>
//             <p className="text-gray-600">
//               Thank you for verifying your details. Your session will
//               automatically end in a few seconds.
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default ThankYouPage;
