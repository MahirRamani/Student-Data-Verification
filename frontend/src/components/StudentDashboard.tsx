// src/components/StudentDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStudentStore } from "../store/studentStore";
import { getStudentData } from "../services/api";
import UpdateDetailsForm from "./UpdateDetailsForm";
import VerificationTab from "./VerificationTab";
import DataConfirmation from "./DataConfirmation";
import { Button } from "./ui/button";
import { AlertCircle, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { rollNo } = useParams<{ rollNo: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<
    "confirmation" | "update" | "verify"
  >("confirmation");

  const student = useStudentStore();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      if (!student.isAuthenticated) {
        navigate("/login");
        return;
      }

      if (student.roll_no !== rollNo) {
        navigate(`/student/${student.roll_no}`);
        return;
      }

      try {
        const data = await getStudentData(rollNo?.toString() || "");
        student.setStudentData(data);
      } catch (err: any) {
        console.error("Failed to fetch student data:", err);
        setError("Failed to load student data. Please try again later.");
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
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem(
        "studentData",
        JSON.stringify({
          roll_no: student.roll_no,
          name: student.name,
          // Store minimal data needed to verify authentication
        })
      );
    }
  }, [student.isAuthenticated, student.roll_no, student.name]);

  // Check for session storage on component mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuthenticated");
    const storedData = sessionStorage.getItem("studentData");

    if (isAuth === "true" && storedData && !student.isAuthenticated) {
      const parsedData = JSON.parse(storedData);
      student.setStudentData({ ...parsedData, isAuthenticated: true });
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("studentData");
    student.logout();
    navigate("/login");
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-blue-600 flex items-center">
            <svg
              className="w-6 h-6 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
            </svg>
            Student Portal
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Welcome, {student.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center"
            >
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

        {currentView === "confirmation" && (
          <DataConfirmation onUpdateNeeded={() => setCurrentView("update")} />
        )}

        {currentView === "update" && (
          <UpdateDetailsForm
            onUpdate={() => setCurrentView("verify")}
            onCancel={() => setCurrentView("confirmation")}
          />
        )}

        {currentView === "verify" && <VerificationTab />}
      </div>
    </div>
  );
};

export default StudentDashboard;
