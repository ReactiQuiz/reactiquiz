// src/components/auth/ForgotPasswordForm.js
import React, { useState } from 'react';
import { Box, TextField, Button, Alert, CircularProgress, Typography } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LockResetIcon from '@mui/icons-material/LockReset';

function ForgotPasswordForm({
  formError,
  successMessage,
  isSubmitting,
  identifier, setIdentifier,
  otp, setOtp,
  newPassword, setNewPassword,
  confirmNewPassword, setConfirmNewPassword,
  onRequestOtp,
  onResetPassword,
  onBackToLogin,
  accentColor,
}) {
  const [stage, setStage] = useState('enterIdentifier'); // 'enterIdentifier' | 'enterOtp'

  const handleRequest = async (e) => {
    e.preventDefault();
    const success = await onRequestOtp();
    if (success) setStage('enterOtp');
  };

  const handleReset = (e) => {
    e.preventDefault();
    onResetPassword();
  };

  if (stage === 'enterIdentifier') {
    return (
      <Box component="form" onSubmit={handleRequest} noValidate sx={{ mt: 1 }}>
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
          Enter your username to receive a password reset OTP.
        </Typography>
        <TextField margin="normal" required fullWidth id="forgot-identifier" label="Username" name="forgotIdentifier"
          autoComplete="username" autoFocus value={identifier} onChange={(e) => setIdentifier(e.target.value)} error={!!formError}
        />
        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        <Button type="submit" fullWidth variant="contained" disabled={isSubmitting}
          sx={{ mt: 2, mb: 1, py: 1.2, backgroundColor: accentColor, '&:hover': { backgroundColor: (theme) => theme.palette.augmentColor({ color: { main: accentColor } }).dark } }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
        >
          {isSubmitting ? 'Sending OTP...' : 'Send Reset OTP'}
        </Button>
        <Button onClick={onBackToLogin} fullWidth sx={{ color: accentColor }}>Back to Login</Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleReset} noValidate sx={{ mt: 1 }}>
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      <TextField margin="normal" required fullWidth id="forgot-otp" label="6-Digit OTP" name="forgotOtp" type="tel"
        inputProps={{ maxLength: 6 }} value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} error={!!formError}
      />
      <TextField margin="normal" required fullWidth name="forgotNewPassword" label="New Password (min. 6 chars)" type="password"
        id="forgot-new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} error={!!formError}
      />
      <TextField margin="normal" required fullWidth name="forgotConfirmNewPassword" label="Confirm New Password" type="password"
        id="forgot-confirm-new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
        error={!!formError || (newPassword !== confirmNewPassword && confirmNewPassword.length > 0)}
        helperText={newPassword !== confirmNewPassword && confirmNewPassword.length > 0 ? "Passwords do not match" : ""}
      />
      {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
      <Button type="submit" fullWidth variant="contained" disabled={isSubmitting}
        sx={{ mt: 2, mb: 1, py: 1.2, backgroundColor: accentColor, '&:hover': { backgroundColor: (theme) => theme.palette.augmentColor({ color: { main: accentColor } }).dark } }}
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LockResetIcon />}
      >
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </Button>
      <Button onClick={() => setStage('enterIdentifier')} fullWidth sx={{ color: accentColor }}>Request OTP Again</Button>
    </Box>
  );
}

export default ForgotPasswordForm;