// src/pages/LoginPage.js
import { useState } from 'react';
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

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for success messages from registration
  const infoMessage = location.state?.message || '';

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { error } = await signIn({
      email: identifier, // Supabase uses email to sign in
      password: password,
    });

    if (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } else {
      // On successful login, AuthContext will update the user state
      // and the ProtectedRoute will handle the redirect automatically.
      // We can also manually navigate if needed.
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
            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
              {inForgotPasswordFlow ? "Reset Password" : "Sign In"}
            </Typography>

            {infoMessage && <Alert severity="success" sx={{ mb: 2 }}>{infoMessage}</Alert>}

            <Box maxWidth="100%">
              <LoginForm
                formError={error}
                isSubmitting={isSubmitting}
                identifier={identifier}
                setIdentifier={setIdentifier}
                password={password}
                setPassword={setPassword}
                onLoginSubmit={handleLogin}
                accentColor={theme.palette.primary.main}
              />
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid >
  );
}

export default LoginPage;