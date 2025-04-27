// src/components/LoginForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../store/studentStore";
import { loginStudent } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { loginSchema, LoginInput } from "../validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const LoginForm = () => {
  const navigate = useNavigate();
  const setStudentData = useStudentStore(
    (state: { setStudentData: any }) => state.setStudentData
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      roll_no: undefined,
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);

    try {
      // Convert roll_no to string for API call
      const response = await loginStudent(String(data.roll_no), data.password);
      setStudentData(response);
      navigate(`/student/${data.roll_no}`);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error || "Failed to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="flex justify-center items-center min-h-screen bg-gray-50">
    //   <Card className="w-full max-w-md shadow-lg">
    //     <CardHeader className="bg-blue-500 text-white rounded-t-lg">
    //       <CardTitle className="text-2xl text-center">Student Login</CardTitle>
    //     </CardHeader>
    //     <CardContent className="p-6 space-y-4">
    //       {error && (
    //         <Alert variant="destructive">
    //           <AlertCircle className="h-4 w-4" />
    //           <AlertDescription>{error}</AlertDescription>
    //         </Alert>
    //       )}

    //       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    //         <div className="space-y-2">
    //           <Label htmlFor="roll_no">Roll Number</Label>
    //           <Input
    //             id="roll_no"
    //             type="text"
    //             {...register('roll_no')}
    //             placeholder="Enter your roll number"
    //           />
    //           {errors.roll_no && (
    //             <p className="text-sm text-red-500">{errors.roll_no.message}</p>
    //           )}
    //         </div>

    //         <div className="space-y-2">
    //           <Label htmlFor="password">Password</Label>
    //           <Input
    //             id="password"
    //             type="password"
    //             {...register('password')}
    //             placeholder="Enter your password"
    //           />
    //           {errors.password && (
    //             <p className="text-sm text-red-500">{errors.password.message}</p>
    //           )}
    //         </div>

    //         <Button
    //           type="submit"
    //           className="w-full"
    //           disabled={loading}
    //         >
    //           {loading ? 'Logging in...' : 'Login'}
    //         </Button>
    //       </form>
    //     </CardContent>
    //   </Card>
    // </div>

    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border border-gray-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
          <CardTitle className="text-2xl text-center font-bold">
            Student Login
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {error && (
            <Alert
              variant="destructive"
              className="bg-red-50 border-red-200 rounded-md"
            >
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="roll_no" className="text-sm font-medium">
                Roll Number
              </Label>
              <Input
                id="roll_no"
                type="text"
                {...register("roll_no")}
                placeholder="Enter your roll number"
                className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              {errors.roll_no && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.roll_no.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter your password"
                className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
