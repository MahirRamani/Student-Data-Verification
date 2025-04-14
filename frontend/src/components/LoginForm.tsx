// src/components/LoginForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../store/studentStore';
import { loginStudent } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { loginSchema, LoginInput } from '../validation/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const LoginForm = () => {
  const navigate = useNavigate();
  const setStudentData = useStudentStore(state => state.setStudentData);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      roll_no: undefined,
      password: ''
    }
  });
  
  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert roll_no to string for API call
      const response = await loginStudent(String(data.roll_no), data.password);
      setStudentData(response);
      navigate(`/student/${data.roll_no}/dashboard`);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-blue-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl text-center">Student Login</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roll_no">Roll Number</Label>
              <Input
                id="roll_no"
                type="text"
                {...register('roll_no')}
                placeholder="Enter your roll number"
              />
              {errors.roll_no && (
                <p className="text-sm text-red-500">{errors.roll_no.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;



// // src/components/LoginForm.tsx
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useStudentStore } from '../store/studentStore';
// import { loginStudent } from '../services/api';
// import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// import { Input } from './ui/input';
// import { Button } from './ui/button';
// import { Label } from './ui/label';
// import { AlertCircle } from 'lucide-react';
// import { Alert, AlertDescription } from './ui/alert';

// const LoginForm = () => {
//   const navigate = useNavigate();
//   const setStudentData = useStudentStore(state => state.setStudentData);
  
//   const [rollNo, setRollNo] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
    
//     try {
//       const data = await loginStudent(rollNo, password);
//       setStudentData(data);
//       navigate(`/student/${rollNo}/dashboard`);
//     } catch (err: any) {
//       console.error('Login error:', err);
//       setError(err.response?.data?.error || 'Failed to login. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-50">
//       <Card className="w-full max-w-md shadow-lg">
//         <CardHeader className="bg-blue-500 text-white rounded-t-lg">
//           <CardTitle className="text-2xl text-center">Student Login</CardTitle>
//         </CardHeader>
//         <CardContent className="p-6 space-y-4">
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
          
//           <form onSubmit={handleLogin} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="roll_no">Roll Number</Label>
//               <Input
//                 id="roll_no"
//                 type="text"
//                 value={rollNo}
//                 onChange={(e) => setRollNo(e.target.value)}
//                 required
//                 placeholder="Enter your roll number"
//               />
//             </div>
            
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 placeholder="Enter your password"
//               />
//             </div>
            
//             <Button 
//               type="submit" 
//               className="w-full"
//               disabled={loading}
//             >
//               {loading ? 'Logging in...' : 'Login'}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default LoginForm;