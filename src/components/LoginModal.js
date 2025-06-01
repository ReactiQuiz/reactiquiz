// src/components/LoginModal.js
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, useTheme, Alert, CircularProgress
} from '@mui/material';
import { darken } from '@mui/material/styles';
import LoginIcon from '@mui/icons-material/Login';
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

function LoginModal({ 
    open, 
    onClose, 
    onLogin, 
    accentColor, 
    authError, 
    setAuthError, 
    deviceChangeInfo, 
    setDeviceChangeInfo, 
    requestDeviceChangeOtp, 
    confirmDeviceWithOtp 
}) {
  const theme = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [localFormError, setLocalFormError] = useState('');
  // emailSentMessage is now deviceChangeInfo.otpSentMessage from App.js

  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  useEffect(() => {
    if (open) { 
        setIdentifier('');
        setRecoveryEmail('');
        setOtp('');
        setLocalFormError('');
        if(setAuthError) setAuthError('');
        // deviceChangeInfo is reset by App.js when modal opens
    }
  }, [open, setAuthError]);


  const clearAllDisplayErrorsModal = () => {
    setLocalFormError('');
    if(setAuthError) setAuthError('');
    if(setDeviceChangeInfo) setDeviceChangeInfo(prev => ({ ...prev, otpSentMessage: '' }));
  };

  const handleModalInputChange = () => {
      clearAllDisplayErrorsModal();
      if (setDeviceChangeInfo && deviceChangeInfo.showPrompt) {
        setDeviceChangeInfo({ showPrompt: false, showOtpInput: false, maskedEmail: null, identifierForChange: null, otpSentMessage: '' });
      }
  };

  const handleLoginAttemptFromModal = async () => {
    clearAllDisplayErrorsModal();
    if (!identifier.trim()) { setLocalFormError('Identifier cannot be empty.'); return; }
    if (!recoveryEmail.trim()) { setLocalFormError('Recovery email is required.'); return; }
    if (!/\S+@\S+\.\S+/.test(recoveryEmail)) { setLocalFormError('Please enter a valid email address.'); return; }

    setIsSubmitting(true);
    setIsSubmitting(false);
    // App.js handles setting currentUser and closing modal on success, or setting authError/deviceChangeInfo
  };

  const handleRequestOtpFromModal = async () => {
    clearAllDisplayErrorsModal();
    if (!deviceChangeInfo.identifierForChange) {
        if(setAuthError) setAuthError("Internal error: Identifier missing for OTP request.");
        return;
    }
    setIsSubmitting(true);
    await requestDeviceChangeOtp(deviceChangeInfo.identifierForChange);
    setIsSubmitting(false);
    // App.js sets deviceChangeInfo.showOtpInput and deviceChangeInfo.otpSentMessage
  };

  const handleSubmitOtpFromModal = async () => {
    clearAllDisplayErrorsModal();
    if (!otp.trim() || otp.length !== 6 || !/^\d+$/.test(otp)) {
        if(setAuthError) setAuthError("Please enter a valid 6-digit OTP.");
        return;
    }
    if (!deviceChangeInfo.identifierForChange) {
        if(setAuthError) setAuthError("Internal error: Identifier missing for OTP submission.");
        return;
    }
    setIsSubmittingOtp(true);
    await confirmDeviceWithOtp(deviceChangeInfo.identifierForChange, otp.trim());
    setIsSubmittingOtp(false);
    // App.js handles success (closing modal) or failure (setting authError)
  };

  const handleActualClose = () => {
    clearAllDisplayErrorsModal();
    if (setDeviceChangeInfo) setDeviceChangeInfo({ showPrompt: false, showOtpInput: false, maskedEmail: null, identifierForChange: null, otpSentMessage: '' });
    onClose();
  };

  const displayError = localFormError || (authError && !deviceChangeInfo?.showPrompt && !deviceChangeInfo?.otpSentMessage);


  return (
    <Dialog open={open} onClose={handleActualClose} PaperProps={{ sx: { minWidth: { xs: '90%', sm: '400px' } } }}>
      <DialogTitle sx={{ backgroundColor: effectiveAccentColor, color: theme.palette.getContrastText(effectiveAccentColor), pb: 1.5, pt: 2, textAlign: 'center' }}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <LoginIcon sx={{mr: 1}}/>
          User Account
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {deviceChangeInfo && deviceChangeInfo.showPrompt ? (
             <Box sx={{ textAlign: 'center', mt: 1 }}>
                {/* This Alert shows the "This account is linked..." message from authError */}
                {authError && !deviceChangeInfo.otpSentMessage && <Alert severity="warning" sx={{mb:1}}>{authError}</Alert>}
                
                {!deviceChangeInfo.showOtpInput && deviceChangeInfo.maskedEmail && (
                  <>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                     This account is linked to a different browser/device. We can send an OTP to <strong>{deviceChangeInfo.maskedEmail}</strong> to authorize this device.
                    </Typography>
                    <Button
                        onClick={handleRequestOtpFromModal}
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
                        sx={{ 
                            backgroundColor: theme.palette.secondary.main, // Use secondary color for this action
                            color: theme.palette.getContrastText(theme.palette.secondary.main),
                            '&:hover': { backgroundColor: darken(theme.palette.secondary.main, 0.15) }
                        }}
                    >
                        {isSubmitting ? 'Sending OTP...' : 'Send Verification OTP'}
                    </Button>
                  </>
                )}
                {!deviceChangeInfo.maskedEmail && !deviceChangeInfo.showOtpInput && (
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                        No recovery email is set for '{deviceChangeInfo.identifierForChange}'. Cannot change device via modal. Please use the Account page or contact support.
                    </Typography>
                )}

                {deviceChangeInfo.showOtpInput && (
                  <>
                    {deviceChangeInfo.otpSentMessage && <Alert severity="success" sx={{my: 2}}>{deviceChangeInfo.otpSentMessage}</Alert>}
                    <TextField
                        margin="dense"
                        required
                        fullWidth
                        id="otp-modal"
                        label="Enter 6-Digit OTP"
                        name="otpModal"
                        type="tel" 
                        inputProps={{ maxLength: 6, pattern: "[0-9]*" }}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        error={!!authError && deviceChangeInfo.showOtpInput}
                        helperText={authError && deviceChangeInfo.showOtpInput ? authError : ''}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSubmitOtpFromModal}
                        disabled={isSubmittingOtp || otp.length !== 6}
                        startIcon={isSubmittingOtp ? <CircularProgress size={20} color="inherit" /> : <VpnKeyIcon />}
                        sx={{ mt:1, 
                            backgroundColor: theme.palette.success.main,
                             '&:hover': { backgroundColor: darken(theme.palette.success.main, 0.15) }
                        }}
                    >
                        {isSubmittingOtp ? 'Verifying...' : 'Verify OTP & Link Device'}
                    </Button>
                  </>
                )}
            </Box>
        ) : (
            <>
                <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', mt: 1}}>
                Enter identifier and recovery email.
                </Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    id="identifier-modal"
                    label="Your Identifier"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); handleModalInputChange();}}
                    error={!!displayError}
                    helperText={displayError || ''}
                    onKeyPress={(e) => { if (e.key === 'Enter' && recoveryEmail) { handleLoginAttemptFromModal(); } }}
                />
                <TextField
                    margin="dense"
                    required
                    fullWidth
                    id="recovery-email-modal"
                    label="Recovery Email Address"
                    name="recoveryEmailModal"
                    type="email"
                    autoComplete="email"
                    value={recoveryEmail}
                    onChange={(e) => { setRecoveryEmail(e.target.value); handleModalInputChange(); }}
                    error={!!displayError && (recoveryEmail.trim() === '' || !/\S+@\S+\.\S+/.test(recoveryEmail))}
                    helperText={(!!displayError && (recoveryEmail.trim() === '' || !/\S+@\S+\.\S+/.test(recoveryEmail))) ? displayError : ''}
                    onKeyPress={(e) => { if (e.key === 'Enter') { handleLoginAttemptFromModal(); } }}
                />
                {authError && !localFormError && !deviceChangeInfo?.showPrompt && !deviceChangeInfo?.otpSentMessage && (
                    <Alert severity="error" sx={{ mt: 1 }}>{authError}</Alert>
                )}
            </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
        <Button onClick={handleActualClose} sx={{ color: theme.palette.text.secondary }}>Cancel</Button>
        {!(deviceChangeInfo && deviceChangeInfo.showPrompt && !deviceChangeInfo.showOtpInput) && // Hide main login if prompting for OTP request
         !(deviceChangeInfo && deviceChangeInfo.showOtpInput) && // Hide main login if showing OTP input
            (
            <Button
            onClick={handleLoginAttemptFromModal}
            variant="contained"
            disabled={isSubmitting}
            sx={{
                backgroundColor: effectiveAccentColor,
                color: theme.palette.getContrastText(effectiveAccentColor),
                '&:hover': { backgroundColor: darken(effectiveAccentColor, 0.15) }
            }}
            >
            {isSubmitting ? 'Processing...' : 'Login / Register'}
            </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default LoginModal;