// src/components/auth/LoginForm.js
import React from 'react';
import { Box, TextField, Button, Alert, CircularProgress, Link as MuiLink } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

function LoginForm({
  formError,
  successMessage,
  isSubmitting,
  identifier,
  setIdentifier,
  password,
  setPassword,
  otp,
  setOtp,
  showOtpInput,
  setShowOtpInput,
  onLoginSubmit,
  onOtpSubmit,
  onForgotPasswordClick,
  accentColor,
}) {

  const handleIdentifierChange = (e) => setIdentifier(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleOtpChange = (e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));

  const handleLogin = (e) => {
    e.preventDefault();
    onLoginSubmit();
  };

  const handleOtp = (e) => {
    e.preventDefault();
    onOtpSubmit();
  };

  if (showOtpInput) {
    return (
      <Box component="form" onSubmit={handleOtp} noValidate sx={{ mt: 1 }}>
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
        <TextField
          margin="normal" required fullWidth id="login-otp" label="6-Digit OTP" name="loginOtp" type="tel"
          inputProps={{ maxLength: 6, pattern: "[0-9]*" }} value={otp} onChange={handleOtpChange} error={!!formError}
        />
        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        <Button type="submit" fullWidth variant="contained" disabled={isSubmitting || otp.length !== 6}
          sx={{ mt: 2, mb: 1, py: 1.2, backgroundColor: accentColor, '&:hover': { backgroundColor: (theme) => theme.palette.augmentColor({ color: { main: accentColor } }).dark } }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <VpnKeyIcon />}
        >
          {isSubmitting ? 'Verifying...' : 'Verify & Login'}
        </Button>
        <Button onClick={() => setShowOtpInput(false)} sx={{ display: 'block', margin: '0 auto', color: accentColor }}>
          Back to Username/Password
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
      <TextField margin="normal" required fullWidth id="login-identifier" label="Username" name="loginIdentifier"
        autoComplete="username" autoFocus value={identifier} onChange={handleIdentifierChange} error={!!formError}
      />
      <TextField margin="normal" required fullWidth name="loginPassword" label="Password" type="password"
        id="login-password" autoComplete="current-password" value={password} onChange={handlePasswordChange} error={!!formError}
      />
      {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
      <Button type="submit" fullWidth variant="contained" disabled={isSubmitting}
        sx={{ mt: 2, mb: 1, py: 1.2, backgroundColor: accentColor, '&:hover': { backgroundColor: (theme) => theme.palette.augmentColor({ color: { main: accentColor } }).dark } }}
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
      >
        {isSubmitting ? 'Requesting OTP...' : 'Request OTP & Login'}
      </Button>
      <Box sx={{ textAlign: 'right', mt: 1 }}>
        <MuiLink component="button" variant="body2" onClick={onForgotPasswordClick} sx={{ cursor: 'pointer', color: accentColor, '&:hover': { textDecoration: 'underline' } }}>
          Forgot Password?
        </MuiLink>
      </Box>
    </Box>
  );
}

export default LoginForm;