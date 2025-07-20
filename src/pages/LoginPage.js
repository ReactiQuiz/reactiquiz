// src/pages/LoginPage.js
import { useState, useEffect } from 'react';
import { Box, Paper, useTheme, Grid, Typography, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuthForms } from '../hooks/useAuthForms';
import LoginForm from '../components/auth/LoginForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';

function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [inForgotPasswordFlow, setInForgotPasswordFlow] = useState(false);
  const [infoMessage, setInfoMessage] = useState(location.state?.message || '');

  const {
    formError, successMessage, isSubmitting,
    loginIdentifier, setLoginIdentifier,
    loginPassword, setLoginPassword,
    loginOtp, setLoginOtp,
    showLoginOtpInput, setShowLoginOtpInput,
    forgotPasswordIdentifier, setForgotPasswordIdentifier,
    forgotPasswordOtp, setForgotPasswordOtp,
    forgotPasswordNewPassword, setForgotPasswordNewPassword,
    forgotPasswordConfirmNewPassword, setForgotPasswordConfirmNewPassword,
    handleLoginSubmit, handleLoginOtpSubmit,
    handleRequestResetOtp, handleResetPasswordWithOtp, clearFormStates,
  } = useAuthForms();

  useEffect(() => {
    if (location.state?.message) {
      setInfoMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handlePasswordResetSuccess = (identifier) => {
    setInForgotPasswordFlow(false);
    setLoginIdentifier(identifier);
    setForgotPasswordIdentifier('');
    setForgotPasswordOtp('');
    setForgotPasswordNewPassword('');
    setForgotPasswordConfirmNewPassword('');
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