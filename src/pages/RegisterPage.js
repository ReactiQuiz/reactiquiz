// src/pages/RegisterPage.js
import { useState } from 'react';
import { Box, Grid, Typography, useTheme, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance'; // Use axios directly
import RegisterForm from '../components/auth/RegisterForm';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';

function RegisterPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  // SIMPLE STATE for the form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [userClass, setUserClass] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);

    try {
      // SIMPLE LOGIC: Use axios to call your API endpoint
      await apiClient.post('/api/users/register', {
        username,
        email,
        password,
        address,
        class: userClass
      });

      // On success, show a message and redirect to the login page
      setSuccessMessage("Registration successful! Please sign in to continue.");
      setTimeout(() => {
        navigate('/login', { state: { message: "Registration successful! Please sign in." } });
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Grid container component="main" sx={{ height: '100%', flexGrow: 1 }}>
      {/* Left Form Panel */}
      <Grid
        item
        square
        width={{
          xs: "100%",
          sx: "60%",
          md: "50%",
          lg: "35%",
          xl: "40%"
        }}
        sx={{
          backgroundColor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            my: { xs: 4, sm: 8 },
            mx: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '450px' }}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              Create Your Account
            </Typography>
            <RegisterForm
              formError={error}
              successMessage={successMessage}
              isSubmitting={isSubmitting}
              identifier={username} setIdentifier={setUsername}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              address={address} setAddress={setAddress}
              userClass={userClass} setUserClass={setUserClass}
              onRegisterSubmit={handleRegister}
              accentColor={theme.palette.primary.main}
            />
          </Box>
        </Box>
      </Grid>

      {/* Right Branding Panel */}
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
        <AuthBrandingPanel variant="register" />
      </Grid>
    </Grid >
  );
}

export default RegisterPage;