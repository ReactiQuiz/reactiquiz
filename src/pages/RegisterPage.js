// src/pages/RegisterPage.js
import { useState } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Use the main AuthContext
import RegisterForm from '../components/auth/RegisterForm';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';

function RegisterPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { signUp } = useAuth(); // Get signUp from context

  // State for the form
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

    const { data, error: signUpError } = await signUp({
      email: email,
      password: password,
      options: {
        // We store extra data in the user's profile table, not during sign up
        data: {
          username: username,
          address: address,
          class: userClass,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message || 'Registration failed.');
    } else {
      // IMPORTANT: Supabase may require email confirmation.
      // This message handles that case.
      setSuccessMessage("Registration successful! Please check your email for a confirmation link to activate your account.");
      // We don't navigate immediately, user needs to confirm their email first.
    }
    setIsSubmitting(false);
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