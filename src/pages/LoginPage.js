// src/pages/LoginPage.js
import { useState, useEffect } from 'react';
import { Box, Grid, Typography, useTheme, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Use the main AuthContext
import LoginForm from '../components/auth/LoginForm';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';

function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth(); // Get the signIn function from context

  // State for this component
  const [email, setEmail] = useState(''); // Supabase uses email for login
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for success messages passed from other pages (like registration)
  const [infoMessage, setInfoMessage] = useState(location.state?.message || '');

  // Clear the info message from location state after displaying it once
  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setIsSubmitting(true);

    const { error: signInError } = await signIn({
      email: email,
      password: password,
    });

    if (signInError) {
      setError(signInError.message || 'Login failed. Please check your credentials.');
    } else {
      // On successful login, the AuthContext will handle the user state.
      // We can navigate the user to the main content area.
      navigate('/subjects');
    }
    setIsSubmitting(false);
  };

  return (
    <Grid container height='100%'>
      {/* Left Branding Panel */}
      <Grid
        item
        width={{
          xs: "0%",
          sx: "40%",
          md: "50%",
          lg: "65%",
          xl: "60%"
        }}
      >
        <AuthBrandingPanel variant="login" />
      </Grid>

      {/* Right Form Panel */}
      <Grid
        item
        width={{
          xs: "100%",
          sx: "60%",
          md: "50%",
          lg: "35%",
          xl: "40%"
        }}
        square
        sx={{
          backgroundColor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <Box
          sx={{
            my: { xs: 4, sm: 8 },
            mx: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '450px' }}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
              Sign In
            </Typography>
            {infoMessage && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{infoMessage}</Alert>}

            <LoginForm
              formError={error}
              isSubmitting={isSubmitting}
              identifier={email} // Pass email as identifier
              setIdentifier={setEmail}
              password={password}
              setPassword={setPassword}
              onLoginSubmit={handleLogin}
              accentColor={theme.palette.primary.main}
            />
          </Box>
        </Box>
      </Grid>
    </Grid >
  );
}

export default LoginPage;