// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import StudentDashboard from './components/StudentDashboard';
// import { useEffect } from 'react';
// import { useStudentStore } from './store/studentStore';

// Private route component
// const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   // const { isAuthenticated } = useStudentStore();

//   // if (!isAuthenticated) {
//   //   return <Navigate to="/login" />;
//   // }

//   return <>{children}</>;
// };

const App = () => {
  // const { isAuthenticated, setStudentData, logout } = useStudentStore();

  // Check for session timeout on initial load
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     const lastActivity = localStorage.getItem('lastActivity');
  //     if (lastActivity) {
  //       const inactiveTime = (Date.now() - parseInt(lastActivity)) / 1000 / 60; // in minutes
  //       if (inactiveTime >= 10) { // 10 minutes timeout
  //         logout();
  //       }
  //     }
  //   }

  //   // Try to recover session from localStorage if exists
  //   const storedSession = localStorage.getItem('studentSession');
  //   if (storedSession && !isAuthenticated) {
  //     try {
  //       const session = JSON.parse(storedSession);
  //       console.log("Session:", session);
        
  //       const lastActivity = localStorage.getItem('firstActivity');
  //       console.log("Session:", lastActivity);
        

  //       if (lastActivity) {
  //         // const inactiveTime = (Date.now() - parseInt(lastActivity)) / 1000 / 60;
  //         if (parseInt(lastActivity) < 1) { // Session still valid
  //           setStudentData(session);
  //         } else {
  //           logout();
  //           localStorage.removeItem('studentSession');
  //           localStorage.removeItem('lastActivity');
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Failed to parse stored session:', error);
  //       localStorage.removeItem('studentSession');
  //       localStorage.removeItem('lastActivity');
  //     }
  //   }
  // }, [isAuthenticated, logout, setStudentData]);

  // // Store session data when authenticated
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     const { 
  //       id, roll_no, name, email, mobile_number, father_mobile_number, 
  //       date_of_birth, address, field_of_study, branch, 
  //       is_data_verified, is_mobile_verified 
  //     } = useStudentStore.getState();

  //     const sessionData = {
  //       id, roll_no, name, email, mobile_number, father_mobile_number,
  //       date_of_birth, address, field_of_study, branch,
  //       is_data_verified, is_mobile_verified
  //     };

  //     localStorage.setItem('studentSession', JSON.stringify(sessionData));
  //     localStorage.setItem('lastActivity', Date.now().toString());
  //   }
  // }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route 
          path="/student/:rollNo" 
          element={
            // <PrivateRoute>
              <StudentDashboard />
            // </PrivateRoute>
          } 
        />
        {/* <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} /> */}
      </Routes>
    </Router>
  );
};

export default App;

// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import LoginForm from './components/LoginForm';
// import StudentDashboard from './components/StudentDashboard';
// import { useStudentStore } from './store/studentStore';

// // Private route component
// const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { isAuthenticated } = useStudentStore();
//   const storedSession = localStorage.getItem('studentSession');

//   // Consider also stored sessions
//   if (!isAuthenticated && !storedSession) {
//     return <Navigate to="/login" />;
//   }

//   return <>{children}</>;
// };

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={<LoginForm />} />
//         <Route
//           path="/student/:rollNo/dashboard"
//           element={
//             <PrivateRoute>
//               <StudentDashboard />
//             </PrivateRoute>
//           }
//         />
//         <Route path="/" element={<Navigate to="/login" />} />
//         <Route path="*" element={<Navigate to="/login" />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;