import React from "react";
import { auth, provider } from "../../Service/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const LoginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const idToken = await user.getIdToken();
      console.log("ID Token:", idToken);

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
          role: "user"
        }),
      });

      const data = await res.json();
      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
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
          minHeight: '100vh',
          pt: 8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 3,
              fontWeight: 'bold',
              color: theme.palette.primary.main,
            }}
          >
            Welcome to HelpNexus
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}
          >
            Sign in to access your dashboard
          </Typography>
          <Button
            onClick={LoginWithGoogle}
            variant="contained"
            startIcon={<GoogleIcon />}
            size="large"
            fullWidth
            sx={{
              py: 1.5,
              textTransform: 'none',
              fontSize: '1.1rem',
            }}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;