// src/pages/AccountPage.js
import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, CircularProgress, useTheme, Avatar
} from '@mui/material';
import { darken } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout'; // Import LogoutIcon

function AccountPage({ 
    currentUser, 
    handleLogin, 
    handleLogout, // Receive handleLogout
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
  const [emailSentMessage, setEmailSentMessage] = useState('');

  useEffect(() => {
    if (authError && !(deviceChangeInfo && deviceChangeInfo.showPrompt)) {
        setLocalFormError('');
    }
    if (deviceChangeInfo?.emailSent) {
        setEmailSentMessage(`A device change confirmation link has been sent. Please check your email related to identifier: ${deviceChangeInfo.identifierForChange}.`);
    }
     // Clear form fields if user logs in successfully elsewhere (e.g. via modal) while on this page
    if (currentUser && (identifier || recoveryEmail)) {
        setIdentifier('');
        setRecoveryEmail('');
        setOtp('');
    }
  }, [authError, deviceChangeInfo, currentUser, identifier, recoveryEmail]);


  const clearAllDisplayErrors = () => {
    setLocalFormError('');
    if (setAuthError) setAuthError(''); 
    setEmailSentMessage('');
  };
  
  const handleLocalInputChange = () => {
      clearAllDisplayErrors();
      if (setDeviceChangeInfo && deviceChangeInfo.showPrompt) {
        setDeviceChangeInfo({ showPrompt: false, showOtpInput: false, maskedEmail: null, identifierForChange: null, otpSentMessage: '' });
      }
  };

  const handleSubmitLoginForm = async (event) => {
    event.preventDefault();
    clearAllDisplayErrors();

    if (!identifier.trim()) { setLocalFormError('Identifier cannot be empty.'); return; }
    if (!recoveryEmail.trim()) { setLocalFormError('Recovery email is required.'); return; }
    if (!/\S+@\S+\.\S+/.test(recoveryEmail)) { setLocalFormError('Please enter a valid email address.'); return; }

    setIsSubmitting(true);
    const result = await handleLogin(identifier.trim(), recoveryEmail.trim());
    setIsSubmitting(false);

    if (result && result.success) {
        // Fields will be cleared by useEffect now
    }
  };

  const handleRequestOtp = async () => {
    clearAllDisplayErrors();
    if (!deviceChangeInfo.identifierForChange) {
        if(setAuthError) setAuthError("Internal error: Identifier missing for OTP request.");
        return;
    }
    setIsSubmitting(true);
    await requestDeviceChangeOtp(deviceChangeInfo.identifierForChange);
    setIsSubmitting(false);
  };

  const handleSubmitOtp = async () => {
    clearAllDisplayErrors();
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
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '600px', margin: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: currentUser ? 'secondary.main' : 'primary.main', width: 56, height: 56 }}>
            <AccountCircleIcon sx={{ fontSize: '2rem' }}/>
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            {currentUser ? `Welcome, ${currentUser.name}!` : 'User Account'}
          </Typography>
        </Box>

        {currentUser ? (
          <Box sx={{textAlign: 'center'}}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              You are currently logged in.
            </Typography>
            {currentUser.recoveryEmail && (
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Recovery Email: {currentUser.recoveryEmail}
                 </Typography>
            )}
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your quiz results will be saved and associated with your account ID: {currentUser.id}.
            </Typography>
            <Button
              variant="outlined"
              color="error" // Or another suitable color like 'primary' with different styling
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{minWidth: '150px'}}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <>
            {deviceChangeInfo && deviceChangeInfo.showPrompt ? (
              // ... (Device change prompt logic - same as before) ...
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                {authError && !deviceChangeInfo.otpSentMessage && <Alert severity="warning" sx={{mb: 2}}>{authError}</Alert>}
                {!deviceChangeInfo.showOtpInput && deviceChangeInfo.maskedEmail && (
                  <>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                     This account is linked to a different browser/device. We can send an OTP to <strong>{deviceChangeInfo.maskedEmail}</strong> to authorize this device.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleRequestOtp}
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
                        sx={{ 
                            backgroundColor: theme.palette.secondary.main, 
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
                        No recovery email is set for '{deviceChangeInfo.identifierForChange}'. Cannot change device.
                    </Typography>
                )}
                {deviceChangeInfo.showOtpInput && (
                  <>
                    {deviceChangeInfo.otpSentMessage && <Alert severity="success" sx={{my: 2}}>{deviceChangeInfo.otpSentMessage}</Alert>}
                    <TextField
                        margin="normal" required fullWidth id="otp-page" label="Enter 6-Digit OTP"
                        name="otp" type="tel" inputProps={{ maxLength: 6, pattern: "[0-9]*" }}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        error={!!authError && deviceChangeInfo.showOtpInput}
                        helperText={authError && deviceChangeInfo.showOtpInput ? authError : ''}
                    />
                    <Button
                        variant="contained" onClick={handleSubmitOtp} disabled={isSubmittingOtp || otp.length !== 6}
                        startIcon={isSubmittingOtp ? <CircularProgress size={20} color="inherit" /> : <VpnKeyIcon />}
                        sx={{ mt:2, backgroundColor: theme.palette.success.main, '&:hover': { backgroundColor: darken(theme.palette.success.main, 0.15) }}}
                    >
                        {isSubmittingOtp ? 'Verifying...' : 'Verify OTP & Link Device'}
                    </Button>
                  </>
                )}
                 <Button 
                    onClick={() => { 
                        clearAllDisplayErrors(); 
                        setIdentifier(''); 
                        setRecoveryEmail(''); 
                        if(setDeviceChangeInfo) setDeviceChangeInfo({ showPrompt: false, showOtpInput: false, maskedEmail: null, identifierForChange: null, otpSentMessage: '' });
                    }} 
                    sx={{ display:'block', margin: '16px auto 0' }}
                >
                    Login with a Different Identifier
                </Button>
              </Box>
            ) : (
              // ... (Login/Register form - same as before) ...
              <Box component="form" onSubmit={handleSubmitLoginForm} noValidate sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                  Enter your identifier and recovery email to login, register, or link this device.
                </Typography>
                <TextField
                    margin="normal" required fullWidth id="identifier-page" label="Your Identifier (e.g., Username)"
                    name="identifier" autoComplete="username" autoFocus value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); handleLocalInputChange(); }}
                    error={!!localFormError || (!!authError && !deviceChangeInfo?.showPrompt && !deviceChangeInfo?.otpSentMessage)}
                    helperText={localFormError || (authError && !deviceChangeInfo?.showPrompt && !deviceChangeInfo?.otpSentMessage ? authError : '')}
                />
                <TextField
                    margin="normal" required fullWidth id="recovery-email-page" label="Recovery Email Address"
                    name="recoveryEmail" type="email" autoComplete="email" value={recoveryEmail}
                    onChange={(e) => { setRecoveryEmail(e.target.value); handleLocalInputChange(); }}
                    error={!!localFormError && (recoveryEmail.trim() === '' || !/\S+@\S+\.\S+/.test(recoveryEmail))}
                    helperText={(!!localFormError && (recoveryEmail.trim() === '' || !/\S+@\S+\.\S+/.test(recoveryEmail))) ? localFormError : ''}
                />
                
                {authError && !localFormError && !deviceChangeInfo?.showPrompt && !deviceChangeInfo?.otpSentMessage && (
                    <Alert severity="error" sx={{ mt: 2 }}>{authError}</Alert>
                )}
                {deviceChangeInfo?.otpSentMessage && !deviceChangeInfo?.showPrompt && (
                    <Alert severity="info" sx={{mt: 2}}>{deviceChangeInfo.otpSentMessage}</Alert>
                )}

                <Button
                  type="submit" fullWidth variant="contained" disabled={isSubmitting}
                  sx={{ mt: 3, mb: 2, backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: darken(theme.palette.primary.main, 0.15) } }}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                >
                  {isSubmitting ? 'Processing...' : 'Login / Register'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}

export default AccountPage;