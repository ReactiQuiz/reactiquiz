// src/pages/LoginPage.js
import { useState, useEffect } from 'react';
import { Box, Grid, Typography, useTheme, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/axiosInstance'; // Use axios directly
import LoginForm from '../components/auth/LoginForm';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';

// A simple function to simulate logging in for the rest of the app
// This should be in your AuthContext, but for simplicity, we define it here.
const loginUser = (userData, token) => {
  localStorage.setItem('reactiquizUser', JSON.stringify(userData));
  localStorage.setItem('reactiquizToken', token);
  window.dispatchEvent(new Event('storage')); // Notify other tabs
};


function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // SIMPLE STATE: No complex hooks needed
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const infoMessage = location.state?.message || '';

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }
    setIsSubmitting(true);

    try {
      // SIMPLE LOGIC: Use axios to call your API endpoint
      const response = await apiClient.post('/api/users/login', {
        username: username,
        password: password,
      });

      // On success, save user and token to localStorage and redirect
      loginUser(response.data.user, response.data.token);
      navigate('/subjects');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              identifier={username}
              setIdentifier={setUsername}
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