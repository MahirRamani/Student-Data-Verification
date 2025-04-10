// src/components/StudentDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudentStore } from '../store/studentStore';
import { fetchStudentData, verifyStudentData } from '../services/api';
import UpdateDetailsForm from './UpdateDetailsForm';
import OtpVerification from './OtpVerification';
import HistoryTab from './HistoryTab';
import { SessionTimeout } from './ui/session-timeout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, LogOut, UserCircle, History, ClipboardList } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { rollNo } = useParams<{ rollNo: string }>();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  
  const student = useStudentStore();
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      if (!student.isAuthenticated) {
        navigate('/login');
        return;
      }
      
      if (student.roll_no !== rollNo) {
        navigate(`/student/${student.roll_no}/dashboard`);
        return;
      }
      
      try {
        const data = await fetchStudentData(student.roll_no);
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
  
  const handleVerify = async () => {
    if (!student.is_mobile_verified) {
      setShowOtpVerification(true);
      return;
    }
    
    setVerifyLoading(true);
    
    try {
      await verifyStudentData(student.roll_no);
      student.setStudentData({ is_data_verified: true });
    } catch (err: any) {
      console.error('Failed to verify data:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  };
  
  const handleLogout = () => {
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
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <SessionTimeout />
      
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Student Portal</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Welcome, {student.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details" className="flex items-center">
              <UserCircle className="h-4 w-4 mr-2" />
              Personal Details
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              Update History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card className="overflow-hidden">
              <CardHeader className="bg-white border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Student Information</CardTitle>
                    <CardDescription>Your personal and academic details</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {!showOtpVerification && !isEditing && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          disabled={loading}
                        >
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Update Details
                        </Button>
                        
                        <Button
                          onClick={handleVerify}
                          disabled={verifyLoading || student.is_data_verified }
                          variant={student.is_data_verified ? "secondary" : "default"}
                        >
                          {student.is_data_verified ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Verified
                            </>
                          ) : (
                            'Verify Data'
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {showOtpVerification ? (
                  <OtpVerification 
                    onVerificationComplete={() => {
                      setShowOtpVerification(false);
                    }}
                  />
                ) : isEditing ? (
                  <UpdateDetailsForm 
                    onCancel={() => setIsEditing(false)} 
                    onUpdate={() => {
                      setIsEditing(false);
                    }} 
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Roll Number</h3>
                        <p className="text-lg font-semibold">{student.roll_no || '-'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Full Name</h3>
                        <p className="text-lg font-semibold">{student.name || '-'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Email Address</h3>
                        <p className="text-lg font-semibold">{student.email || '-'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Mobile Number</h3>
                        <div className="flex items-center">
                          <p className="text-lg font-semibold mr-2">{student.mobile_number || '-'}</p>
                          {student.is_mobile_verified ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">Not Verified</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Date of Birth</h3>
                        <p className="text-lg font-semibold">{formatDate(student.date_of_birth)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Father's Mobile Number</h3>
                        <p className="text-lg font-semibold">{student.father_mobile_number || '-'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Field of Study</h3>
                        <p className="text-lg font-semibold">{student.field_of_study || '-'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Branch</h3>
                        <p className="text-lg font-semibold">{student.branch || '-'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
                        <p className="text-lg font-semibold">{student.address || '-'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Verification Status</h3>
                        <div className="flex gap-2">
                          {student.is_data_verified ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Data Verified</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">Verification Pending</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <HistoryTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;