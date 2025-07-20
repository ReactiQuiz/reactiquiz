// src/pages/RegisterPage.js
import { Box, Paper, useTheme, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAuthForms } from '../hooks/useAuthForms';
import RegisterForm from '../components/auth/RegisterForm';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';

function RegisterPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    formError, successMessage, isSubmitting,
    registerIdentifier, setRegisterIdentifier,
    registerEmail, setRegisterEmail,
    registerPassword, setRegisterPassword,
    registerConfirmPassword, setRegisterConfirmPassword,
    registerAddress, setRegisterAddress,
    registerClass, setUserClass,
    handleRegisterSubmit,
  } = useAuthForms();

  const handleRegistrationSuccess = () => {
    navigate('/login', {
      state: { message: 'Registration successful! Please log in to continue.' }
    });
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