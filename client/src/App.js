import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import Dashboard from './Pages/User/Dashboard';
import Community from './Pages/User/Community';
import Login from "./Pages/User/Login";
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import { auth } from './Service/firebase';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

// Protected Route component
const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/" />;
  }
  return children;
};

// Public Route component (for login pages)
const PublicRoute = ({ children, user }) => {
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function AppContent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: isDarkMode ? 'background.paper' : 'primary.main',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: isDarkMode ? 'text.primary' : 'white'
            }}
          >
            HelpNexus
          </Typography>
          <ThemeToggle />
          <Button 
            component={Link} 
            to="/"
            sx={{ 
              color: isDarkMode ? 'text.primary' : 'white',
              '&:hover': {
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            Home
          </Button>
          {user && (
            <>
              <Button 
                component={Link} 
                to="/dashboard"
                sx={{ 
                  color: isDarkMode ? 'text.primary' : 'white',
                  '&:hover': {
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                Dashboard
              </Button>
              <Button 
                component={Link} 
                to="/community"
                sx={{ 
                  color: isDarkMode ? 'text.primary' : 'white',
                  '&:hover': {
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                Community
              </Button>
              <Button 
                onClick={handleSignOut}
                sx={{ 
                  color: isDarkMode ? 'text.primary' : 'white',
                  '&:hover': {
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                Sign Out
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container>
        <Routes>
          <Route 
            path="/" 
            element={
              <PublicRoute user={user}>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/community" 
            element={
              <ProtectedRoute user={user}>
                <Community />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/login/admin" 
            element={
              <PublicRoute user={user}>
                <AdminLogin />
              </PublicRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute user={user}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Container>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
