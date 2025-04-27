// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import LoginForm from "./components/LoginForm";
import StudentDashboard from "./components/StudentDashboard";
import ThankYouPage from "./components/ThankYouPage";
import { useEffect, useState } from "react";
import { useStudentStore } from "./store/studentStore";

// Route wrapper that handles redirect on refresh properly
const RouteHandler: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, setStudentData } = useStudentStore();
  const [isLoading, setIsLoading] = useState(true);
  // const location = useLocation();

  useEffect(() => {
    // Try to recover session from localStorage on component mount
    const storedSession = localStorage.getItem("studentSession");
    const SESSION_TIMEOUT_MINUTES = 5;

    if (storedSession && !isAuthenticated) {
      try {
        const session = JSON.parse(storedSession);
        const lastActivity = localStorage.getItem("lastActivity");

        if (lastActivity) {
          const inactiveTime =
            (Date.now() - parseInt(lastActivity)) / (1000 * 60);
          if (inactiveTime < SESSION_TIMEOUT_MINUTES) {
            // Session still valid
            setStudentData(session);
            localStorage.setItem("lastActivity", Date.now().toString());
          } else {
            localStorage.removeItem("studentSession");
            localStorage.removeItem("lastActivity");
          }
        }
      } catch (error) {
        console.error("Failed to parse stored session:", error);
        localStorage.removeItem("studentSession");
        localStorage.removeItem("lastActivity");
      }
    }

    setIsLoading(false);
  }, [isAuthenticated, setStudentData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

// Private route component
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useStudentStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// ThankYou page with auto-logout
const ThankYouWithAutoLogout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useStudentStore();

  useEffect(() => {
    // Auto-logout after 2 seconds
    const timer = setTimeout(() => {
      logout();
      localStorage.removeItem("studentSession");
      localStorage.removeItem("lastActivity");
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [logout, navigate]);

  return <ThankYouPage />;
};

const App = () => {
  const { isAuthenticated, logout } = useStudentStore();
  const SESSION_TIMEOUT_MINUTES = 5;

  // Check for session timeout and set up activity tracking
  useEffect(() => {
    // Function to check session validity
    const checkSessionValidity = () => {
      if (isAuthenticated) {
        const lastActivity = localStorage.getItem("lastActivity");
        if (lastActivity) {
          const inactiveTime =
            (Date.now() - parseInt(lastActivity)) / (1000 * 60); // in minutes
          if (inactiveTime >= SESSION_TIMEOUT_MINUTES) {
            console.log("Session timed out after inactivity");
            logout();
            localStorage.removeItem("studentSession");
            localStorage.removeItem("lastActivity");
          }
        }
      }
    };

    // Set interval for periodic checks
    const intervalId = setInterval(checkSessionValidity, 60000); // Check every minute

    // Set up event listeners to track user activity
    const updateActivity = () => {
      if (isAuthenticated) {
        localStorage.setItem("lastActivity", Date.now().toString());
      }
    };

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keypress", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("scroll", updateActivity);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keypress", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("scroll", updateActivity);
    };
  }, [isAuthenticated, logout]);

  // Store session data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const {
        id,
        roll_no,
        name,
        date_of_birth,
        mobile_number,
        email,
        father_mobile_number,
        field_of_study,
        address,
        taluka,
        city,
        district,
        pincode,
        is_data_verified,
        is_mobile_verified,
      } = useStudentStore.getState();

      const sessionData = {
        id,
        roll_no,
        name,
        date_of_birth,
        mobile_number,
        email,
        father_mobile_number,
        field_of_study,
        address,
        taluka,
        city,
        district,
        pincode,
        is_data_verified,
        is_mobile_verified,
      };

      localStorage.setItem("studentSession", JSON.stringify(sessionData));
      localStorage.setItem("lastActivity", Date.now().toString());
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <RouteHandler>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/student/:rollNo/"
            element={
              <PrivateRoute>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/thank-you"
            element={
              <PrivateRoute>
                <ThankYouWithAutoLogout />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </RouteHandler>
    </Router>
  );
};

export default App;
