// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, useTheme, Avatar, Tabs, Tab, Alert } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuthForms } from '../hooks/useAuthForms'; // <-- Import the main hook
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const ACCENT_COLOR = theme.palette.accountAccent?.main || theme.palette.primary.main;

  const [activeTab, setActiveTab] = useState(0);
  const [inForgotPasswordFlow, setInForgotPasswordFlow] = useState(false);
  const [infoMessage, setInfoMessage] = useState(location.state?.message || '');

  // Use the custom hook to get all form logic and state
  const {
    formError, successMessage, isSubmitting,
    loginIdentifier, setLoginIdentifier,
    loginPassword, setLoginPassword,
    loginOtp, setLoginOtp,
    showLoginOtpInput, setShowLoginOtpInput,
    registerIdentifier, setRegisterIdentifier,
    registerEmail, setRegisterEmail,
    registerPassword, setRegisterPassword,
    registerConfirmPassword, setRegisterConfirmPassword,
    registerAddress, setRegisterAddress,
    registerClass, setUserClass,
    forgotPasswordIdentifier, setForgotPasswordIdentifier,
    forgotPasswordOtp, setForgotPasswordOtp,
    forgotPasswordNewPassword, setForgotPasswordNewPassword,
    forgotPasswordConfirmNewPassword, setForgotPasswordConfirmNewPassword,
    handleLoginSubmit, handleLoginOtpSubmit, handleRegisterSubmit,
    handleRequestResetOtp, handleResetPasswordWithOtp, clearFormStates,
  } = useAuthForms();
  
  // Clear any location-based message once it's been set, to prevent re-showing
  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    clearFormStates();
  };

  const handleRegistrationSuccess = (newIdentifier) => {
    setActiveTab(0);
    setLoginIdentifier(newIdentifier);
    // Clear registration fields
    setRegisterIdentifier(''); setRegisterEmail(''); setRegisterPassword('');
    setRegisterConfirmPassword(''); setRegisterAddress(''); setUserClass('');
  };
  
  const handlePasswordResetSuccess = (identifier) => {
    setInForgotPasswordFlow(false);
    setActiveTab(0);
    setLoginIdentifier(identifier);
    // Clear forgot password fields
    setForgotPasswordIdentifier(''); setForgotPasswordOtp(''); setForgotPasswordNewPassword('');
    setForgotPasswordConfirmNewPassword('');
  };


  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 128px)', p: { xs: 2, sm: 3 } }}>
      <Paper elevation={6} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2, borderTop: `5px solid ${ACCENT_COLOR}`, maxWidth: '500px', width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: ACCENT_COLOR, width: 60, height: 60 }}>
            <AccountCircleIcon sx={{ fontSize: '2.5rem' }} />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 1, fontWeight: 'bold', color: ACCENT_COLOR }}>
            {inForgotPasswordFlow ? "Reset Password" : (activeTab === 0 ? "User Login" : "Create Account")}
          </Typography>
        </Box>

        {infoMessage && <Alert severity="info" sx={{ mb: 2 }}>{infoMessage}</Alert>}

        {!inForgotPasswordFlow ? (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="login register tabs" variant="fullWidth" TabIndicatorProps={{ style: { backgroundColor: ACCENT_COLOR, height: 3 } }} sx={{ '& .MuiTab-root': { color: theme.palette.text.secondary, '&.Mui-selected': { color: ACCENT_COLOR, fontWeight: 'bold' } } }}>
                <Tab label="Login" />
                <Tab label="Create Account" />
              </Tabs>
            </Box>
            {activeTab === 0 && (
              <LoginForm
                formError={formError} successMessage={successMessage} isSubmitting={isSubmitting}
                identifier={loginIdentifier} setIdentifier={setLoginIdentifier}
                password={loginPassword} setPassword={setLoginPassword}
                otp={loginOtp} setOtp={setLoginOtp}
                showOtpInput={showLoginOtpInput} setShowOtpInput={setShowLoginOtpInput}
                onLoginSubmit={handleLoginSubmit} onOtpSubmit={handleLoginOtpSubmit}
                onForgotPasswordClick={() => { setInForgotPasswordFlow(true); clearFormStates(); }}
                accentColor={ACCENT_COLOR}
              />
            )}
            {activeTab === 1 && (
              <RegisterForm
                formError={formError} successMessage={successMessage} isSubmitting={isSubmitting}
                identifier={registerIdentifier} setIdentifier={setRegisterIdentifier}
                email={registerEmail} setEmail={setRegisterEmail}
                password={registerPassword} setPassword={setRegisterPassword}
                confirmPassword={registerConfirmPassword} setConfirmPassword={setRegisterConfirmPassword}
                address={registerAddress} setAddress={setRegisterAddress}
                userClass={registerClass} setUserClass={setUserClass}
                onRegisterSubmit={() => handleRegisterSubmit(handleRegistrationSuccess)}
                accentColor={ACCENT_COLOR}
              />
            )}
          </>
        ) : (
          <ForgotPasswordForm
            formError={formError} successMessage={successMessage} isSubmitting={isSubmitting}
            identifier={forgotPasswordIdentifier} setIdentifier={setForgotPasswordIdentifier}
            otp={forgotPasswordOtp} setOtp={setForgotPasswordOtp}
            newPassword={forgotPasswordNewPassword} setNewPassword={setForgotPasswordNewPassword}
            confirmNewPassword={forgotPasswordConfirmNewPassword} setConfirmNewPassword={setForgotPasswordConfirmNewPassword}
            onRequestOtp={handleRequestResetOtp}
            onResetPassword={() => handleResetPasswordWithOtp(handlePasswordResetSuccess)}
            onBackToLogin={() => { setInForgotPasswordFlow(false); clearFormStates(); }}
            accentColor={ACCENT_COLOR}
          />
        )}
      </Paper>
    </Box>
  );
}

export default LoginPage;