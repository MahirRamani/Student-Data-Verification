// src/components/ui/session-timeout.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../store/studentStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';

// Session timeout in minutes
const SESSION_TIMEOUT = 10; 

export const SessionTimeout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, lastActivity, logout, updateLastActivity } = useStudentStore();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = (now - lastActivity) / 1000 / 60; // in minutes
      
      if (inactiveTime >= SESSION_TIMEOUT - 1 && !showWarning) {
        setShowWarning(true);
        setCountdown(60);
      }
      
      if (inactiveTime >= SESSION_TIMEOUT) {
        clearInterval(checkInterval);
        logout();
        navigate('/login');
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, lastActivity, logout, navigate, showWarning]);

  useEffect(() => {
    if (showWarning) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showWarning]);

  const handleStayLoggedIn = () => {
    updateLastActivity();
    setShowWarning(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Listen for user activity
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const events = ['click', 'keypress', 'scroll', 'mousemove'];
    
    const handleActivity = () => {
      updateLastActivity();
    };
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, updateLastActivity]);

  if (!showWarning || !isAuthenticated) return null;

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Timeout Warning</DialogTitle>
          <DialogDescription>
            Your session will expire in {countdown} seconds due to inactivity.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
          <Button onClick={handleStayLoggedIn}>
            Stay Logged In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};