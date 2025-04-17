  import { useEffect, useState } from 'react';
  import { useNavigate, useParams, useLocation } from 'react-router-dom';
  import { useStudentStore } from '../store/studentStore';
  import { getStudentData } from '../services/api';
  import UpdateDetailsForm from './UpdateDetailsForm';
  import HistoryTab from './HistoryTab';
  import VerificationTab from './VerificationTab';
  import { SessionTimeout } from './ui/session-timeout';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
  import { Button } from './ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
  import { Badge } from './ui/badge';
  import { AlertCircle, LogOut, UserCircle, History, ShieldCheck, PenSquare } from 'lucide-react';
  import { Alert, AlertDescription } from './ui/alert';

  const StudentDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { rollNo } = useParams<{ rollNo: string }>();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('details');
    
    const student = useStudentStore();
    
    useEffect(() => {
      // Check if we should set an active tab from location state
      if (location.state && location.state.activeTab) {
        setActiveTab(location.state.activeTab);
      }
    }, [location.state]);
    
    useEffect(() => {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        
        // if (!student.isAuthenticated) {
        //   navigate('/login');
        //   return;
        // }
        
        // if (student.roll_no !== rollNo) {
        //   navigate(`/student/${student.roll_no}`);
        //   return;
        // }
        
        try {
          const data = await getStudentData(rollNo?.toString() || "757");
          student.setStudentData(data);
        } catch (err: any) {
          console.error('Failed to fetch student data:', err);
          setError('Failed to load student data. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    }, [student.isAuthenticated, student.roll_no, rollNo, navigate]);
    
    // Store authentication state in sessionStorage to persist during page refresh
    useEffect(() => {
      // If authenticated, save to session storage
      if (student.isAuthenticated) {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('studentData', JSON.stringify({
          roll_no: student.roll_no,
          name: student.name,
          // Store minimal data needed to verify authentication
        }));
      }
    }, [student.isAuthenticated, student.roll_no, student.name]);
    
    // Check for session storage on component mount
    useEffect(() => {
      const isAuth = sessionStorage.getItem('isAuthenticated');
      const storedData = sessionStorage.getItem('studentData');
      
      if (isAuth === 'true' && storedData && !student.isAuthenticated) {
        const parsedData = JSON.parse(storedData);
        student.isAuthenticated = true;
        student.setStudentData(parsedData);
      }
    }, [student]);
    

    const handleLogout = () => {
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('studentData');
      student.logout();
      navigate('/login');
    };
    
    // Format date for display
    const formatDate = (dateString: string) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      );
    }
    
    // return (
    //   <div className="min-h-screen bg-gray-50 pb-12">
    //     <SessionTimeout />
        
    //     {/* Header */}
    //     <header className="bg-white border-b">
    //       <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
    //         <h1 className="text-2xl font-bold text-blue-600">Student Portal</h1>
    //         <div className="flex items-center gap-2">
    //           <span className="text-sm text-gray-600 hidden sm:inline">
    //             Welcome, {student.name}
    //           </span>
    //           <Button variant="outline" size="sm" onClick={handleLogout}>
    //             <LogOut className="h-4 w-4 mr-2" />
    //             Logout
    //           </Button>
    //         </div>
    //       </div>
    //     </header>
        
    //     <div className="max-w-6xl mx-auto px-4 py-8">
    //       {error && (
    //         <Alert variant="destructive" className="mb-6">
    //           <AlertCircle className="h-4 w-4" />
    //           <AlertDescription>{error}</AlertDescription>
    //         </Alert>
    //       )}
          
    //       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
    //         <TabsList className="mb-6 flex flex-wrap">
    //           <TabsTrigger value="details" className="flex items-center">
    //             <UserCircle className="h-4 w-4 mr-2" />
    //             Personal Details
    //           </TabsTrigger>
    //           <TabsTrigger value="update" className="flex items-center">
    //             <PenSquare className="h-4 w-4 mr-2" />
    //             Update Details
    //           </TabsTrigger>
    //           <TabsTrigger value="verification" className="flex items-center">
    //             <ShieldCheck className="h-4 w-4 mr-2" />
    //             Verify Data
    //           </TabsTrigger>
    //           <TabsTrigger value="history" className="flex items-center">
    //             <History className="h-4 w-4 mr-2" />
    //             Update History
    //           </TabsTrigger>
    //         </TabsList>
            
    //         <TabsContent value="details">
    //           <Card className="overflow-hidden">
    //             <CardHeader className="bg-white border-b">
    //               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
    //                 <div>
    //                   <CardTitle className="text-xl">Student Information</CardTitle>
    //                   <CardDescription>Your personal and academic details</CardDescription>
    //                 </div>
    //                 <Button
    //                   variant="outline"
    //                   onClick={() => setActiveTab('update')}
    //                   disabled={loading}
    //                   className="mt-2 sm:mt-0"
    //                 >
    //                   Update Details
    //                 </Button>
    //               </div>
    //             </CardHeader>
                
    //             <CardContent className="p-6">
    //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //                 <div className="space-y-6">
    //                   <div>
    //                     <h3 className="text-sm font-medium text-gray-500 mb-2">Roll Number</h3>
    //                     <p className="text-lg font-semibold">{student.roll_no || '-'}</p>
    //                   </div>
                      
    //                   <div>
    //                     <h3 className="text-sm font-medium text-gray-500 mb-2">Full Name</h3>
    //                     <p className="text-lg font-semibold">{student.name || '-'}</p>
    //                   </div>
                      
    //                   <div>
    //                     <h3 className="text-sm font-medium text-gray-500 mb-2">Email Address</h3>
    //                     <p className="text-lg font-semibold">{student.email || '-'}</p>
    //                   </div>
                      
    //                   <div>
    //                     <h3 className="text-sm font-medium text-gray-500 mb-2">Mobile Number</h3>
    //                     <p className="text-lg font-semibold">{student.mobile_number || '-'}</p>
    //                   </div>
                      
    //                   <div>
    //                     <h3 className="text-sm font-medium text-gray-500 mb-2">Date of Birth</h3>
    //                     <p className="text-lg font-semibold">{formatDate(student.date_of_birth)}</p>
    //                   </div>
    //                 </div>
                    
    //                 <div className="space-y-6">
    //                   <div>
    //                     <h3 className="text-sm font-medium text-gray-500 mb-2">Father's Mobile Number</h3>
    //                     <p className="text-lg font-semibold">{student.father_mobile_number || '-'}</p>
    //                   </div>
                      
    //                   <div>
    //                     <h3 className="text-sm font-medium text-gray-500 mb-2">Field of Study</h3>
    //                     <p className="text-lg font-semibold">{student.field_of_study || '-'}</p>
    //                   </div>
                      
    //                   <div>
    //                     <h3 className="text-sm font-medium text-gray-500 mb-2">Branch</h3>
    //                     <p className="text-lg font-semibold">{student.branch || '-'}</p>
    //                   </div>
                      
    //                   <div>
    //                     <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
    //                     <p className="text-lg font-semibold">{student.address || '-'}</p>
    //                   </div>
                      
    //                   <div>
    //                     <h3 className="text-sm font-medium text-gray-500 mb-2">Verification Status</h3>
    //                     <div>
    //                       {student.is_data_verified ? (
    //                         <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Data Verified</Badge>
    //                       ) : (
    //                         <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">Verification Pending</Badge>
    //                       )}
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </CardContent>
    //           </Card>
    //         </TabsContent>
            
    //         <TabsContent value="update">
    //           <UpdateDetailsForm 
    //             onUpdate={() => {
    //               // After update, switch back to details tab
    //               setActiveTab('details');
    //             }}
    //             onCancel={() => {
    //               // On cancel, go back to details tab
    //               setActiveTab('details');
    //             }}
    //           />
    //         </TabsContent>
            
    //         <TabsContent value="verification">
    //           <VerificationTab />
    //         </TabsContent>
            
    //         <TabsContent value="history">
    //           <HistoryTab />
    //         </TabsContent>
    //       </Tabs>
    //     </div>
    //   </div>
    // );
  
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 pb-12">
        <SessionTimeout />
        
        {/* Header */}
        <header className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold text-blue-600 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
              </svg>
              Student Portal
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">
                Welcome, {student.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center">
                <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>
        
        <div className="max-w-6xl mx-auto px-4 py-6">
          {error && (
            <Alert variant="destructive" className="mb-6 animate-fadeIn">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 flex flex-wrap bg-white p-1 rounded-lg shadow-sm">
              <TabsTrigger value="details" className="flex items-center text-xs sm:text-sm py-2 px-2 sm:px-3">
                <UserCircle className="h-4 w-4 mr-1 sm:mr-2" />
                <span>Details</span>
              </TabsTrigger>
              <TabsTrigger value="update" className="flex items-center text-xs sm:text-sm py-2 px-2 sm:px-3">
                <PenSquare className="h-4 w-4 mr-1 sm:mr-2" />
                <span>Update</span>
              </TabsTrigger>
              <TabsTrigger value="verification" className="flex items-center text-xs sm:text-sm py-2 px-2 sm:px-3">
                <ShieldCheck className="h-4 w-4 mr-1 sm:mr-2" />
                <span>Verify</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center text-xs sm:text-sm py-2 px-2 sm:px-3">
                <History className="h-4 w-4 mr-1 sm:mr-2" />
                <span>History</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="animate-fadeIn">
              <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-white border-b">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <CardTitle className="text-xl flex items-center text-blue-700">
                        <UserCircle className="h-5 w-5 mr-2 text-blue-500" />
                        Student Information
                      </CardTitle>
                      <CardDescription>Your personal and academic details</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('update')}
                      disabled={loading}
                      className="mt-2 sm:mt-0 bg-blue-50 hover:bg-blue-100 border-blue-200"
                    >
                      <PenSquare className="h-4 w-4 mr-2" />
                      Update Details
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Roll Number</h3>
                        <p className="text-lg font-semibold text-blue-700">{student.roll_no || '-'}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                        <p className="text-lg font-semibold text-blue-700">{student.name || '-'}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Email Address</h3>
                        <p className="text-lg font-semibold text-blue-700 break-words">{student.email || '-'}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Mobile Number</h3>
                        <p className="text-lg font-semibold text-blue-700">{student.mobile_number || '-'}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h3>
                        <p className="text-lg font-semibold text-blue-700">{formatDate(student.date_of_birth)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Father's Mobile Number</h3>
                        <p className="text-lg font-semibold text-blue-700">{student.father_mobile_number || '-'}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Field of Study</h3>
                        <p className="text-lg font-semibold text-blue-700">{student.field_of_study || '-'}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Branch</h3>
                        <p className="text-lg font-semibold text-blue-700">{student.branch || '-'}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                        <p className="text-lg font-semibold text-blue-700">{student.address || '-'}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Verification Status</h3>
                        <div className="mt-1">
                          {student.is_data_verified ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 py-1">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              Data Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50 py-1">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                              </svg>
                              Verification Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="update" className="animate-fadeIn">
              <UpdateDetailsForm 
                onUpdate={() => setActiveTab('details')}
                onCancel={() => setActiveTab('details')}
              />
            </TabsContent>
            
            <TabsContent value="verification" className="animate-fadeIn">
              <VerificationTab />
            </TabsContent>
            
            <TabsContent value="history" className="animate-fadeIn">
              <HistoryTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
    
  };

  export default StudentDashboard;



// // src/components/StudentDashboard.tsx
// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useStudentStore } from '../store/studentStore';
// import { getStudentData } from '../services/api';
// import UpdateDetailsForm from './UpdateDetailsForm';
// import HistoryTab from './HistoryTab';
// import VerificationTab from './VerificationTab';
// import { SessionTimeout } from './ui/session-timeout';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { Button } from './ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Badge } from './ui/badge';
// import { AlertCircle, LogOut, UserCircle, History, ShieldCheck } from 'lucide-react';
// import { Alert, AlertDescription } from './ui/alert';

// const StudentDashboard = () => {
//   const navigate = useNavigate();
//   const { rollNo } = useParams<{ rollNo: string }>();
  
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   const student = useStudentStore();
  
//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       setError(null);
      
//       if (!student.isAuthenticated) {
//         navigate('/login');
//         return;
//       }
      
//       if (student.roll_no !== rollNo) {
//         navigate(`/student/${student.roll_no}`);
//         return;
//       }
      
//       try {
//         const data = await getStudentData(student.roll_no);
//         student.setStudentData(data);
//       } catch (err: any) {
//         console.error('Failed to fetch student data:', err);
//         setError('Failed to load student data. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     loadData();
//   }, [student.isAuthenticated, student.roll_no, rollNo, navigate]);
  
//   // Store authentication state in sessionStorage to persist during page refresh
//   useEffect(() => {
//     // If authenticated, save to session storage
//     if (student.isAuthenticated) {
//       sessionStorage.setItem('isAuthenticated', 'true');
//       sessionStorage.setItem('studentData', JSON.stringify({
//         roll_no: student.roll_no,
//         name: student.name,
//         // Store minimal data needed to verify authentication
//       }));
//     }
//   }, [student.isAuthenticated, student.roll_no, student.name]);
  
//   // Check for session storage on component mount
//   useEffect(() => {
//     const isAuth = sessionStorage.getItem('isAuthenticated');
//     const storedData = sessionStorage.getItem('studentData');
    
//     if (isAuth === 'true' && storedData && !student.isAuthenticated) {
//       const parsedData = JSON.parse(storedData);
//       student.isAuthenticated = true;
//       student.setStudentData(parsedData);
//     }
//   }, [student]);
  
//   const handleLogout = () => {
//     sessionStorage.removeItem('isAuthenticated');
//     sessionStorage.removeItem('studentData');
//     student.logout();
//     navigate('/login');
//   };
  
//   // Format date for display
//   const formatDate = (dateString: string) => {
//     if (!dateString) return '-';
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };
  
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="min-h-screen bg-gray-50 pb-12">
//       <SessionTimeout />
      
//       {/* Header */}
//       <header className="bg-white border-b">
//         <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-blue-600">Student Portal</h1>
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600 hidden sm:inline">
//               Welcome, {student.name}
//             </span>
//             <Button variant="outline" size="sm" onClick={handleLogout}>
//               <LogOut className="h-4 w-4 mr-2" />
//               Logout
//             </Button>
//           </div>
//         </div>
//       </header>
      
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         {error && (
//           <Alert variant="destructive" className="mb-6">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}
        
//         <Tabs defaultValue="details" className="w-full">
//           <TabsList className="mb-6 flex flex-wrap">
//             <TabsTrigger value="details" className="flex items-center">
//               <UserCircle className="h-4 w-4 mr-2" />
//               Personal Details
//             </TabsTrigger>
//             <TabsTrigger value="verification" className="flex items-center">
//               <ShieldCheck className="h-4 w-4 mr-2" />
//               Verify Data
//             </TabsTrigger>
//             <TabsTrigger value="history" className="flex items-center">
//               <History className="h-4 w-4 mr-2" />
//               Update History
//             </TabsTrigger>
//           </TabsList>
          
//           <TabsContent value="details">
//             <Card className="overflow-hidden">
//               <CardHeader className="bg-white border-b">
//                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
//                   <div>
//                     <CardTitle className="text-xl">Student Information</CardTitle>
//                     <CardDescription>Your personal and academic details</CardDescription>
//                   </div>
//                   {!isEditing && (
//                     <Button
//                       variant="outline"
//                       onClick={() => setIsEditing(true)}
//                       disabled={loading}
//                       className="mt-2 sm:mt-0"
//                     >
//                       Update Details
//                     </Button>
//                   )}
//                 </div>
//               </CardHeader>
              
//               <CardContent className="p-6">
//                 {isEditing ? (
//                   <UpdateDetailsForm 
//                     onCancel={() => setIsEditing(false)} 
//                     onUpdate={() => {
//                       setIsEditing(false);
//                     }} 
//                   />
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-6">
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-500 mb-2">Roll Number</h3>
//                         <p className="text-lg font-semibold">{student.roll_no || '-'}</p>
//                       </div>
                      
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-500 mb-2">Full Name</h3>
//                         <p className="text-lg font-semibold">{student.name || '-'}</p>
//                       </div>
                      
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-500 mb-2">Email Address</h3>
//                         <p className="text-lg font-semibold">{student.email || '-'}</p>
//                       </div>
                      
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-500 mb-2">Mobile Number</h3>
//                         <p className="text-lg font-semibold">{student.mobile_number || '-'}</p>
//                       </div>
                      
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-500 mb-2">Date of Birth</h3>
//                         <p className="text-lg font-semibold">{formatDate(student.date_of_birth)}</p>
//                       </div>
//                     </div>
                    
//                     <div className="space-y-6">
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-500 mb-2">Father's Mobile Number</h3>
//                         <p className="text-lg font-semibold">{student.father_mobile_number || '-'}</p>
//                       </div>
                      
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-500 mb-2">Field of Study</h3>
//                         <p className="text-lg font-semibold">{student.field_of_study || '-'}</p>
//                       </div>
                      
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-500 mb-2">Branch</h3>
//                         <p className="text-lg font-semibold">{student.branch || '-'}</p>
//                       </div>
                      
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
//                         <p className="text-lg font-semibold">{student.address || '-'}</p>
//                       </div>
                      
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-500 mb-2">Verification Status</h3>
//                         <div>
//                           {student.is_data_verified ? (
//                             <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Data Verified</Badge>
//                           ) : (
//                             <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">Verification Pending</Badge>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
          
//           <TabsContent value="verification">
//             <VerificationTab />
//           </TabsContent>
          
//           <TabsContent value="history">
//             <HistoryTab />
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// };

// export default StudentDashboard;

// // // src/components/StudentDashboard.tsx
// // import { useEffect, useState } from 'react';
// // import { useNavigate, useParams } from 'react-router-dom';
// // import { useStudentStore } from '../store/studentStore';
// // import { getStudentData, verifyStudentData } from '../services/api';
// // import UpdateDetailsForm from './UpdateDetailsForm';
// // import OtpVerification from './OtpVerification';
// // import HistoryTab from './HistoryTab';
// // import { SessionTimeout } from './ui/session-timeout';
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// // import { Button } from './ui/button';
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// // import { Badge } from './ui/badge';
// // import { AlertCircle, CheckCircle, LogOut, UserCircle, History, ClipboardList } from 'lucide-react';
// // import { Alert, AlertDescription } from './ui/alert';

// // const StudentDashboard = () => {
// //   const navigate = useNavigate();
// //   const { rollNo } = useParams<{ rollNo: string }>();
  
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [showOtpVerification, setShowOtpVerification] = useState(false);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [verifyLoading, setVerifyLoading] = useState(false);
  
// //   const student = useStudentStore();
  
// //   useEffect(() => {
// //     const loadData = async () => {
// //       setLoading(true);
// //       setError(null);
      
// //       if (!student.isAuthenticated) {
// //         navigate('/login');
// //         return;
// //       }
      
// //       if (student.roll_no !== rollNo) {
// //         navigate(`/student/${student.roll_no}/dashboard`);
// //         return;
// //       }
      
// //       try {
// //         const data = await getStudentData(student.roll_no);
// //         student.setStudentData(data);
// //       } catch (err: any) {
// //         console.error('Failed to fetch student data:', err);
// //         setError('Failed to load student data. Please try again later.');
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
    
// //     loadData();
// //   }, [student.isAuthenticated, student.roll_no, rollNo, navigate]);
  
// //   const handleVerify = async () => {
// //     if (!student.is_mobile_verified) {
// //       setShowOtpVerification(true);
// //       return;
// //     }
    
// //     setVerifyLoading(true);
    
// //     try {
// //       await verifyStudentData(student.roll_no);
// //       student.setStudentData({ is_data_verified: true });
// //     } catch (err: any) {
// //       console.error('Failed to verify data:', err);
// //       setError('Verification failed. Please try again.');
// //     } finally {
// //       setVerifyLoading(false);
// //     }
// //   };
  
// //   const handleLogout = () => {
// //     student.logout();
// //     navigate('/login');
// //   };
  
// //   // Format date for display
// //   const formatDate = (dateString: string) => {
// //     if (!dateString) return '-';
// //     const date = new Date(dateString);
// //     return date.toLocaleDateString();
// //   };
  
// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gray-50">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
// //           <p className="mt-4 text-gray-600">Loading your dashboard...</p>
// //         </div>
// //       </div>
// //     );
// //   }
  
// //   return (
// //     <div className="min-h-screen bg-gray-50 pb-12">
// //       <SessionTimeout />
      
// //       {/* Header */}
// //       <header className="bg-white border-b">
// //         <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
// //           <h1 className="text-2xl font-bold text-blue-600">Student Portal</h1>
// //           <div className="flex items-center gap-2">
// //             <span className="text-sm text-gray-600 hidden sm:inline">
// //               Welcome, {student.name}
// //             </span>
// //             <Button variant="outline" size="sm" onClick={handleLogout}>
// //               <LogOut className="h-4 w-4 mr-2" />
// //               Logout
// //             </Button>
// //           </div>
// //         </div>
// //       </header>
      
// //       <div className="max-w-6xl mx-auto px-4 py-8">
// //         {error && (
// //           <Alert variant="destructive" className="mb-6">
// //             <AlertCircle className="h-4 w-4" />
// //             <AlertDescription>{error}</AlertDescription>
// //           </Alert>
// //         )}
        
// //         <Tabs defaultValue="details" className="w-full">
// //           <TabsList className="mb-6">
// //             <TabsTrigger value="details" className="flex items-center">
// //               <UserCircle className="h-4 w-4 mr-2" />
// //               Personal Details
// //             </TabsTrigger>
// //             <TabsTrigger value="history" className="flex items-center">
// //               <History className="h-4 w-4 mr-2" />
// //               Update History
// //             </TabsTrigger>
// //           </TabsList>
          
// //           <TabsContent value="details">
// //             <Card className="overflow-hidden">
// //               <CardHeader className="bg-white border-b">
// //                 <div className="flex justify-between items-center">
// //                   <div>
// //                     <CardTitle className="text-xl">Student Information</CardTitle>
// //                     <CardDescription>Your personal and academic details</CardDescription>
// //                   </div>
// //                   <div className="flex space-x-2">
// //                     {!showOtpVerification && !isEditing && (
// //                       <>
// //                         <Button
// //                           variant="outline"
// //                           onClick={() => setIsEditing(true)}
// //                           disabled={loading}
// //                         >
// //                           <ClipboardList className="h-4 w-4 mr-2" />
// //                           Update Details
// //                         </Button>
                        
// //                         <Button
// //                           onClick={handleVerify}
// //                           disabled={verifyLoading || student.is_data_verified }
// //                           variant={student.is_data_verified ? "secondary" : "default"}
// //                         >
// //                           {student.is_data_verified ? (
// //                             <>
// //                               <CheckCircle className="h-4 w-4 mr-2" />
// //                               Verified
// //                             </>
// //                           ) : (
// //                             'Verify Data'
// //                           )}
// //                         </Button>
// //                       </>
// //                     )}
// //                   </div>
// //                 </div>
// //               </CardHeader>
              
// //               <CardContent className="p-6">
// //                 {showOtpVerification ? (
// //                   <OtpVerification 
// //                     onVerificationComplete={() => {
// //                       setShowOtpVerification(false);
// //                     }}
// //                   />
// //                 ) : isEditing ? (
// //                   <UpdateDetailsForm 
// //                     onCancel={() => setIsEditing(false)} 
// //                     onUpdate={() => {
// //                       setIsEditing(false);
// //                     }} 
// //                   />
// //                 ) : (
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                     <div className="space-y-6">
// //                       <div>
// //                         <h3 className="text-sm font-medium text-gray-500 mb-2">Roll Number</h3>
// //                         <p className="text-lg font-semibold">{student.roll_no || '-'}</p>
// //                       </div>
                      
// //                       <div>
// //                         <h3 className="text-sm font-medium text-gray-500 mb-2">Full Name</h3>
// //                         <p className="text-lg font-semibold">{student.name || '-'}</p>
// //                       </div>
                      
// //                       <div>
// //                         <h3 className="text-sm font-medium text-gray-500 mb-2">Email Address</h3>
// //                         <p className="text-lg font-semibold">{student.email || '-'}</p>
// //                       </div>
                      
// //                       <div>
// //                         <h3 className="text-sm font-medium text-gray-500 mb-2">Mobile Number</h3>
// //                         <div className="flex items-center">
// //                           <p className="text-lg font-semibold mr-2">{student.mobile_number || '-'}</p>
// //                           {student.is_mobile_verified ? (
// //                             <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
// //                           ) : (
// //                             <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">Not Verified</Badge>
// //                           )}
// //                         </div>
// //                       </div>
                      
// //                       <div>
// //                         <h3 className="text-sm font-medium text-gray-500 mb-2">Date of Birth</h3>
// //                         <p className="text-lg font-semibold">{formatDate(student.date_of_birth)}</p>
// //                       </div>
// //                     </div>
                    
// //                     <div className="space-y-6">
// //                       <div>
// //                         <h3 className="text-sm font-medium text-gray-500 mb-2">Father's Mobile Number</h3>
// //                         <p className="text-lg font-semibold">{student.father_mobile_number || '-'}</p>
// //                       </div>
                      
// //                       <div>
// //                         <h3 className="text-sm font-medium text-gray-500 mb-2">Field of Study</h3>
// //                         <p className="text-lg font-semibold">{student.field_of_study || '-'}</p>
// //                       </div>
                      
// //                       <div>
// //                         <h3 className="text-sm font-medium text-gray-500 mb-2">Branch</h3>
// //                         <p className="text-lg font-semibold">{student.branch || '-'}</p>
// //                       </div>
                      
// //                       <div>
// //                         <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
// //                         <p className="text-lg font-semibold">{student.address || '-'}</p>
// //                       </div>
                      
// //                       <div>
// //                         <h3 className="text-sm font-medium text-gray-500 mb-2">Verification Status</h3>
// //                         <div className="flex gap-2">
// //                           {student.is_data_verified ? (
// //                             <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Data Verified</Badge>
// //                           ) : (
// //                             <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">Verification Pending</Badge>
// //                           )}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 )}
// //               </CardContent>
// //             </Card>
// //           </TabsContent>
          
// //           <TabsContent value="history">
// //             <HistoryTab />
// //           </TabsContent>
// //         </Tabs>
// //       </div>
// //     </div>
// //   );
// // };

// // export default StudentDashboard;