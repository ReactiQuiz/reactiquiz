// src/components/auth/ForgotPasswordForm.tsx
/**
 * Forgot Password Form Component
 * 
 * This component displays a multi-stage form for password reset.
 * It handles OTP (One-Time Password) generation and password reset
 * with validation and error handling.
 */
import React, { useState } from 'react';
import { Box, TextField, Button, Alert, CircularProgress, Typography } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LockResetIcon from '@mui/icons-material/LockReset';

/**
 * Forgot Password Form Component
 * 
 * Displays a multi-stage password reset form. Features:
 * - Stage 1: Enter username to request OTP
 * - Stage 2: Enter OTP and new password
 * - Form validation (password matching, OTP format)
 * - Loading states during submission
 * - Error/success message display
 * 
 * This component is used on the LoginPage for password recovery
 * when users forget their password.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.formError] - Form error message (optional)
 * @param {string} [props.successMessage] - Success message (optional)
 * @param {boolean} props.isSubmitting - Whether form is submitting
 * @param {string} props.identifier - Username/identifier input value
 * @param {(value: string) => void} props.setIdentifier - Setter for identifier
 * @param {string} props.otp - OTP input value
 * @param {(value: string) => void} props.setOtp - Setter for OTP
 * @param {string} props.newPassword - New password input value
 * @param {(value: string) => void} props.setNewPassword - Setter for new password
 * @param {string} props.confirmNewPassword - Confirm password input value
 * @param {(value: string) => void} props.setConfirmNewPassword - Setter for confirm password
 * @param {() => Promise<boolean>} props.onRequestOtp - Callback to request OTP
 * @param {() => void} props.onResetPassword - Callback to reset password
 * @param {() => void} props.onBackToLogin - Callback to return to login
 * @param {string} props.accentColor - Accent color for buttons
 * @returns {JSX.Element} Forgot password form with stages
 */
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
  // Stage state: 'enterIdentifier' for username input, 'enterOtp' for OTP and password
  const [stage, setStage] = useState('enterIdentifier'); // 'enterIdentifier' | 'enterOtp'

  /**
   * Handle Request OTP
   * 
   * Handles OTP request when user submits username.
   * Advances to OTP stage if request is successful.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleRequest = async (e) => {
    e.preventDefault();
    // Request OTP from server
    const success = await onRequestOtp();
    // Advance to OTP stage if request succeeded
    if (success) setStage('enterOtp');
  };

  /**
   * Handle Reset Password
   * 
   * Handles password reset when user submits OTP and new password.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleReset = (e) => {
    e.preventDefault();
    // Call reset password callback
    onResetPassword();
  };

  // Stage 1: Enter username to request OTP
  if (stage === 'enterIdentifier') {
    return (
      <Box component="form" onSubmit={handleRequest} noValidate sx={{ mt: 1 }}>
        {/* Instruction Text */}
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
          Enter your username to receive a password reset OTP.
        </Typography>
        
        {/* Username Input Field */}
        <TextField 
          margin="normal" 
          required 
          fullWidth 
          id="forgot-identifier" 
          label="Username" 
          name="forgotIdentifier"
          autoComplete="username" 
          autoFocus 
          value={identifier} 
          onChange={(e) => setIdentifier(e.target.value)} 
          error={!!formError}
        />
        
        {/* Error Alert */}
        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        
        {/* Send OTP Button */}
        <Button 
          type="submit" 
          fullWidth 
          variant="contained" 
          disabled={isSubmitting}
          sx={{ 
            mt: 2, 
            mb: 1, 
            py: 1.2, 
            backgroundColor: accentColor, 
            '&:hover': { 
              backgroundColor: (theme) => theme.palette.augmentColor({ color: { main: accentColor } }).dark 
            } 
          }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
        >
          {isSubmitting ? 'Sending OTP...' : 'Send Reset OTP'}
        </Button>
        
        {/* Back to Login Button */}
        <Button onClick={onBackToLogin} fullWidth sx={{ color: accentColor }}>
          Back to Login
        </Button>
      </Box>
    );
  }

  // Stage 2: Enter OTP and new password

  return (
    <Box component="form" onSubmit={handleReset} noValidate sx={{ mt: 1 }} width="100%">
      {/* Success Message Alert */}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      
      {/* OTP Input Field - Only accepts numeric input, max 6 digits */}
      <TextField 
        margin="normal" 
        required 
        fullWidth 
        id="forgot-otp" 
        label="6-Digit OTP" 
        name="forgotOtp" 
        type="tel"
        inputProps={{ maxLength: 6 }} 
        value={otp} 
        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
        error={!!formError}
      />
      
      {/* New Password Field */}
      <TextField 
        margin="normal" 
        required 
        fullWidth 
        name="forgotNewPassword" 
        label="New Password (min. 6 chars)" 
        type="password"
        id="forgot-new-password" 
        value={newPassword} 
        onChange={(e) => setNewPassword(e.target.value)} 
        error={!!formError}
      />
      
      {/* Confirm Password Field - Validates password match */}
      <TextField 
        margin="normal" 
        required 
        fullWidth 
        name="forgotConfirmNewPassword" 
        label="Confirm New Password" 
        type="password"
        id="forgot-confirm-new-password" 
        value={confirmNewPassword} 
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        error={!!formError || (newPassword !== confirmNewPassword && confirmNewPassword.length > 0)}
        helperText={newPassword !== confirmNewPassword && confirmNewPassword.length > 0 ? "Passwords do not match" : ""}
      />
      
      {/* Error Alert */}
      {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
      
      {/* Reset Password Button */}
      <Button 
        type="submit" 
        fullWidth 
        variant="contained" 
        disabled={isSubmitting}
        sx={{ 
          mt: 2, 
          mb: 1, 
          py: 1.2, 
          backgroundColor: accentColor, 
          '&:hover': { 
            backgroundColor: (theme) => theme.palette.augmentColor({ color: { main: accentColor } }).dark 
          } 
        }}
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LockResetIcon />}
      >
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </Button>
      
      {/* Request OTP Again Button - Returns to stage 1 */}
      <Button 
        onClick={() => setStage('enterIdentifier')} 
        fullWidth 
        sx={{ color: accentColor }}
      >
        Request OTP Again
      </Button>
    </Box>
  );
}

export default ForgotPasswordForm;