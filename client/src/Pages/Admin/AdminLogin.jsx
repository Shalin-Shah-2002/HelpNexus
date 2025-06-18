import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../Service/firebase';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Get the ID token for backend verification
      const idToken = await user.getIdToken();
      
      // Verify admin status with backend
      const Base_URL = "http://localhost:5000/api/login";
      const res = await fetch(Base_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: idToken,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "admin"  // Specify admin role
        }),
      });

      const data = await res.json();
      
      if (data.success && data.role === "admin") {
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Unauthorized access. Only administrators are allowed.');
        await auth.signOut(); // Sign out if not an admin
      }
    } catch (error) {
      console.error('Error during admin sign in:', error);
      setError('Failed to sign in. Please try again.');
      await auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Admin Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            fullWidth
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Only users with admin privileges can access this dashboard.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin;