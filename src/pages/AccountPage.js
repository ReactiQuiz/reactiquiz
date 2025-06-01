// src/pages/AccountPage.js
import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, CircularProgress, useTheme, Avatar,
  Tabs, Tab, Divider, Stack, Link as MuiLink
} from '@mui/material';
import { darken } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import LockResetIcon from '@mui/icons-material/LockReset';
import GroupIcon from '@mui/icons-material/Group'; 
import { useNavigate } from 'react-router-dom';

import apiClient from '../api/axiosInstance';

function AccountPage({
    currentUser,
    handleLogout,
    setAuthError, // Main auth error prop setter from App.js
    setCurrentUser,
    authError, // Main authError from App.js
    onOpenChangePasswordModal
}) {
  const theme = useTheme(); 
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0); // For Login/Register tabs when not logged in

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [showLoginOtpInput, setShowLoginOtpInput] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isSubmittingLoginOtp, setIsSubmittingLoginOtp] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');

  // Registration State
  const [registerIdentifier, setRegisterIdentifier] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState('');

  // Forgot Password State
  const [forgotPasswordStage, setForgotPasswordStage] = useState('idle');
  const [forgotPasswordIdentifier, setForgotPasswordIdentifier] = useState('');
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');
  const [forgotPasswordNewPassword, setForgotPasswordNewPassword] = useState('');
  const [forgotPasswordConfirmNewPassword, setForgotPasswordConfirmNewPassword] = useState('');
  const [isSubmittingForgotPassword, setIsSubmittingForgotPassword] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState({ type: '', text: ''});

  // Use a local error state for this page's forms to avoid conflict with global authError
  const [localPageError, setLocalPageError] = useState(''); 

  useEffect(() => {
    // Clear local errors and messages when tab changes or user logs in/out
    setLocalPageError('');
    setLoginSuccessMessage('');
    setRegisterSuccessMessage('');
    setForgotPasswordMessage({ type: '', text: ''});
    if(setAuthError) setAuthError(''); // Clear global auth error too if needed

    if (!currentUser) {
        // Reset login/register form fields only if not logged in and tab changes
        setLoginIdentifier(''); 
        setLoginPassword(''); 
        setShowLoginOtpInput(false); 
        setLoginOtp('');
        setRegisterIdentifier(''); 
        setRegisterEmail(''); 
        setRegisterPassword(''); 
        setRegisterConfirmPassword('');
        setForgotPasswordStage('idle'); 
        setForgotPasswordIdentifier(''); 
        setForgotPasswordOtp(''); 
        setForgotPasswordNewPassword(''); 
        setForgotPasswordConfirmNewPassword('');
    }
  }, [activeTab, currentUser, setAuthError]); 

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault(); 
    setLocalPageError('');
    setLoginSuccessMessage('');
    setShowLoginOtpInput(false); 
    setLoginOtp('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLocalPageError('Username and password are required.');
      return;
    }
    setIsSubmittingLogin(true);
    try {
      const response = await apiClient.post('/api/users/login', {
        identifier: loginIdentifier.trim(),
        password: loginPassword
      });
      setLoginSuccessMessage(response.data.message || "OTP has been sent to your email.");
      setShowLoginOtpInput(true); 
      setLoginPassword(''); 
    } catch (error) {
      setLocalPageError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      setShowLoginOtpInput(false);
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleLoginOtpSubmit = async (event) => {
    event.preventDefault(); 
    setLocalPageError('');
    if (!loginOtp.trim() || loginOtp.length !== 6 || !/^\d+$/.test(loginOtp)) {
      setLocalPageError('Please enter a valid 6-digit OTP.');
      return;
    }
    setIsSubmittingLoginOtp(true);
    const deviceId = await import('../utils/deviceId').then(mod => mod.getOrSetDeviceID());
    try {
      const response = await apiClient.post('/api/users/verify-otp', {
        identifier: loginIdentifier.trim(),
        otp: loginOtp.trim(),
        deviceIdFromClient: deviceId
      });
      if (response.data && response.data.user && response.data.token) {
        const userData = {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email
        };
        setCurrentUser({ ...userData, token: response.data.token });
        localStorage.setItem('reactiquizUser', JSON.stringify(userData));
        localStorage.setItem('reactiquizToken', response.data.token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      } else {
        setLocalPageError(response.data.message || "OTP verification failed.");
      }
    } catch (error) {
      setLocalPageError(error.response?.data?.message || 'Error verifying OTP.');
    } finally {
      setIsSubmittingLoginOtp(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault(); 
    setLocalPageError('');
    setRegisterSuccessMessage('');
    if (!registerIdentifier.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setLocalPageError('Username, email, and password are required.');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setLocalPageError('Passwords do not match.');
      return;
    }
    if (registerPassword.length < 6) {
      setLocalPageError('Password must be at least 6 characters long.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(registerEmail)) {
      setLocalPageError('Invalid email format.');
      return;
    }
    setIsSubmittingRegister(true);
    try {
      const response = await apiClient.post('/api/users/register', {
        identifier: registerIdentifier.trim(),
        email: registerEmail.trim().toLowerCase(),
        password: registerPassword
      });
      setRegisterSuccessMessage(response.data.message || "Registration successful! Please login.");
      setRegisterIdentifier('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setActiveTab(0); 
    } catch (error) {
      setLocalPageError(error.response?.data?.message || 'Registration failed.');
    } finally {
      setIsSubmittingRegister(false);
    }
  };

  const handleForgotPasswordLinkClick = () => { 
    setForgotPasswordStage('enterIdentifier');
    setLocalPageError('');
    setLoginSuccessMessage('');
    setShowLoginOtpInput(false); 
  };

  const handleRequestResetOtp = async (event) => {
    event.preventDefault(); 
    setForgotPasswordMessage({ type: '', text: '' });
    if (!forgotPasswordIdentifier.trim()) {
      setForgotPasswordMessage({ type: 'error', text: 'Please enter your username.' });
      return;
    }
    setIsSubmittingForgotPassword(true);
    try {
      const response = await apiClient.post('/api/users/request-password-reset', { identifier: forgotPasswordIdentifier.trim() });
      setForgotPasswordMessage({ type: 'success', text: response.data.message || "If an account exists, an OTP has been sent."});
      setForgotPasswordStage('enterOtp');
    } catch (error) {
      setForgotPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Failed to request OTP.' });
    } finally {
      setIsSubmittingForgotPassword(false);
    }
  };

  const handleResetPasswordWithOtp = async (event) => { 
    event.preventDefault(); 
    setForgotPasswordMessage({ type: '', text: '' });
    if (!forgotPasswordOtp.trim() || forgotPasswordOtp.length !== 6 || !/^\d+$/.test(forgotPasswordOtp)) {
        setForgotPasswordMessage({ type: 'error', text: 'Please enter a valid 6-digit OTP.' });
        return;
    }
    if (!forgotPasswordNewPassword || !forgotPasswordConfirmNewPassword) {
        setForgotPasswordMessage({ type: 'error', text: 'New password and confirmation are required.' });
        return;
    }
    if (forgotPasswordNewPassword.length < 6) {
        setForgotPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
        return;
    }
    if (forgotPasswordNewPassword !== forgotPasswordConfirmNewPassword) {
        setForgotPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
        return;
    }
    setIsSubmittingForgotPassword(true);
    try {
        const response = await apiClient.post('/api/users/reset-password-with-otp', {
            identifier: forgotPasswordIdentifier.trim(),
            otp: forgotPasswordOtp.trim(),
            newPassword: forgotPasswordNewPassword
        });
        setForgotPasswordMessage({ type: 'success', text: response.data.message || "Password reset successfully. Please login." });
        setForgotPasswordStage('idle'); 
        setActiveTab(0); 
        setForgotPasswordIdentifier('');
        setForgotPasswordOtp('');
        setForgotPasswordNewPassword('');
        setForgotPasswordConfirmNewPassword('');
    } catch (error) {
        setForgotPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reset password.'});
    } finally {
      setIsSubmittingForgotPassword(false);
    }
  };

  // If user is logged in, show profile options
  if (currentUser) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '600px', margin: 'auto', mt: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mr: 2 }}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <AccountCircleIcon sx={{ fontSize: '2rem' }} />}
              </Avatar>
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {currentUser.name}
                </Typography>
                {currentUser.email && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ fontSize: '1rem', mr: 0.5, opacity: 0.7 }} />
                    {currentUser.email}
                  </Typography>
                )}
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2} sx={{ mt: 2, alignItems: 'flex-start' }}>
                <Button variant="outlined" onClick={() => navigate('/friends')} startIcon={<GroupIcon />} sx={{ borderColor: theme.palette.info.main, color: theme.palette.info.main }}>
                    Manage Friends
                </Button>
              <Button variant="outlined" onClick={onOpenChangePasswordModal} startIcon={<VpnKeyIcon />} sx={{ borderColor: theme.palette.info.main, color: theme.palette.info.main }}>
                Change Password
              </Button>
              <Button variant="contained" color="error" onClick={handleLogout} startIcon={<LogoutIcon />}>
                Logout
              </Button>
            </Stack>
        </Paper>
      </Box>
    );
  }
  
  // If not logged in, show Login/Register tabs
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '600px', margin: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <AccountCircleIcon sx={{ fontSize: '2rem' }}/>
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            User Account
          </Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="login register tabs" centered>
            <Tab label="Login" id="login-tab" aria-controls="login-panel" />
            <Tab label="Create Account" id="register-tab" aria-controls="register-panel" />
          </Tabs>
        </Box>

        {/* Login Panel */}
        <Box role="tabpanel" hidden={activeTab !== 0} id="login-panel" aria-labelledby="login-tab">
            {forgotPasswordStage === 'idle' && !showLoginOtpInput && (
            <Box component="form" onSubmit={handleLoginSubmit} noValidate sx={{ mt: 1 }}>
                <TextField margin="normal" required fullWidth id="login-identifier" label="Username" name="loginIdentifier" autoComplete="username" autoFocus value={loginIdentifier} onChange={(e) => { setLoginIdentifier(e.target.value); setLocalPageError(''); setLoginSuccessMessage('');}} error={!!localPageError && !loginSuccessMessage && activeTab === 0 } helperText={activeTab === 0 && localPageError && !loginSuccessMessage ? localPageError : ''}/>
                <TextField margin="normal" required fullWidth name="loginPassword" label="Password" type="password" id="login-password" autoComplete="current-password" value={loginPassword} onChange={(e) => { setLoginPassword(e.target.value); setLocalPageError(''); setLoginSuccessMessage(''); }} error={!!localPageError && !loginSuccessMessage && activeTab === 0 } helperText={activeTab === 0 && localPageError && !loginSuccessMessage && loginPassword.length === 0 ? localPageError : ''} />
                <Button type="submit" fullWidth variant="contained" disabled={isSubmittingLogin} sx={{ mt: 3, mb: 1, backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: darken(theme.palette.primary.main, 0.15) } }} startIcon={isSubmittingLogin ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}>
                {isSubmittingLogin ? 'Requesting OTP...' : 'Request OTP'}
                </Button>
                <Box sx={{ textAlign: 'right', mt: 1 }}><MuiLink component="button" variant="body2" onClick={handleForgotPasswordLinkClick} sx={{cursor: 'pointer'}}>Forgot Password?</MuiLink></Box>
            </Box>
            )}
            {showLoginOtpInput && forgotPasswordStage === 'idle' && (
                <Box component="form" onSubmit={handleLoginOtpSubmit} noValidate sx={{ mt: 1 }}>
                {loginSuccessMessage && <Alert severity="success" sx={{ mb: 2 }}>{loginSuccessMessage}</Alert>}
                <Typography variant="body2" sx={{mb:1}}>Enter the OTP sent to your registered email for <strong>{loginIdentifier}</strong>.</Typography>
                <TextField margin="normal" required fullWidth id="login-otp" label="6-Digit OTP" name="loginOtp" type="tel" inputProps={{ maxLength: 6, pattern: "[0-9]*" }} value={loginOtp} onChange={(e) => setLoginOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} error={!!localPageError && activeTab === 0} helperText={(localPageError && activeTab === 0) ? localPageError : ''} autoFocus />
                <Button type="submit" fullWidth variant="contained" disabled={isSubmittingLoginOtp || loginOtp.length !== 6} sx={{ mt: 3, mb: 2, backgroundColor: theme.palette.success.main, '&:hover': { backgroundColor: darken(theme.palette.success.main, 0.15) } }} startIcon={isSubmittingLoginOtp ? <CircularProgress size={20} color="inherit" /> : <VpnKeyIcon />}>
                    {isSubmittingLoginOtp ? 'Verifying...' : 'Verify OTP & Login'}
                </Button>
                <Button onClick={() => {setShowLoginOtpInput(false); setLoginSuccessMessage(''); setLocalPageError(''); setLoginOtp('');}} sx={{display:'block', margin: '0 auto'}}>Back to Username/Password</Button>
                </Box>
            )}
            {forgotPasswordStage === 'enterIdentifier' && (
            <Box component="form" onSubmit={handleRequestResetOtp} noValidate sx={{ mt: 1 }}>
                <Typography variant="h6" gutterBottom>Reset Password</Typography><Typography variant="body2" sx={{mb:1}}>Enter your username to receive a password reset OTP.</Typography>
                <TextField margin="normal" required fullWidth id="forgot-identifier" label="Username" name="forgotIdentifier" autoComplete="username" autoFocus value={forgotPasswordIdentifier} onChange={(e) => setForgotPasswordIdentifier(e.target.value)} error={!!forgotPasswordMessage.text && forgotPasswordMessage.type === 'error'}/>
                {forgotPasswordMessage.text && <Alert severity={forgotPasswordMessage.type} sx={{ mt: 2 }}>{forgotPasswordMessage.text}</Alert>}
                <Button type="submit" fullWidth variant="contained" disabled={isSubmittingForgotPassword} sx={{ mt: 3, mb: 2 }} startIcon={isSubmittingForgotPassword ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}>
                    {isSubmittingForgotPassword ? 'Sending...' : 'Send Reset OTP'}
                </Button>
                <Button onClick={() => {setForgotPasswordStage('idle'); setForgotPasswordMessage({ type: '', text: ''});}} fullWidth>Back to Login</Button>
            </Box>
            )}
            {forgotPasswordStage === 'enterOtp' && (
                <Box component="form" onSubmit={handleResetPasswordWithOtp} noValidate sx={{ mt: 1 }}>
                <Typography variant="h6" gutterBottom>Set New Password</Typography>
                {forgotPasswordMessage.type === 'success' && forgotPasswordMessage.text.toLowerCase().includes("otp has been sent") && <Alert severity="success" sx={{ mb: 2 }}>{forgotPasswordMessage.text}</Alert>}
                <Typography variant="body2" sx={{mb:1}}>An OTP has been sent to the email associated with <strong>{forgotPasswordIdentifier}</strong>.</Typography>
                <TextField margin="normal" required fullWidth id="forgot-otp" label="6-Digit OTP" name="forgotOtp" type="tel" inputProps={{ maxLength: 6, pattern: "[0-9]*" }} value={forgotPasswordOtp} onChange={(e) => setForgotPasswordOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} error={!!forgotPasswordMessage.text && forgotPasswordMessage.type === 'error'}/>
                <TextField margin="normal" required fullWidth name="forgotNewPassword" label="New Password (min. 6 chars)" type="password" id="forgot-new-password" value={forgotPasswordNewPassword} onChange={(e) => setForgotPasswordNewPassword(e.target.value)} error={!!forgotPasswordMessage.text && forgotPasswordMessage.type === 'error'}/>
                <TextField margin="normal" required fullWidth name="forgotConfirmNewPassword" label="Confirm New Password" type="password" id="forgot-confirm-new-password" value={forgotPasswordConfirmNewPassword} onChange={(e) => setForgotPasswordConfirmNewPassword(e.target.value)} error={(!!forgotPasswordMessage.text && forgotPasswordMessage.type === 'error') || (forgotPasswordNewPassword !== forgotPasswordConfirmNewPassword && forgotPasswordConfirmNewPassword.length > 0)} helperText={forgotPasswordNewPassword !== forgotPasswordConfirmNewPassword && forgotPasswordConfirmNewPassword.length > 0 ? "Passwords do not match" : ""}/>
                {forgotPasswordMessage.text && forgotPasswordMessage.type === 'error' && <Alert severity="error" sx={{ mt: 2 }}>{forgotPasswordMessage.text}</Alert>}
                <Button type="submit" fullWidth variant="contained" disabled={isSubmittingForgotPassword || forgotPasswordOtp.length !== 6 || !forgotPasswordNewPassword} sx={{ mt: 3, mb: 2 }} startIcon={isSubmittingForgotPassword ? <CircularProgress size={20} color="inherit" /> : <LockResetIcon />}>
                    {isSubmittingForgotPassword ? 'Resetting...' : 'Reset Password'}
                </Button>
                <Button onClick={() => {setForgotPasswordStage('enterIdentifier'); setForgotPasswordMessage({ type: '', text: ''}); setForgotPasswordOtp('');}} fullWidth>Request OTP Again / Change Username</Button>
                </Box>
            )}
        </Box>

        {/* Register Panel */}
        <Box role="tabpanel" hidden={activeTab !== 1} id="register-panel" aria-labelledby="register-tab">
            <Box component="form" onSubmit={handleRegisterSubmit} noValidate sx={{ mt: 1 }}>
            <TextField margin="normal" required fullWidth id="register-identifier" label="Username" name="registerIdentifier" autoComplete="username" autoFocus value={registerIdentifier} onChange={(e) => { setRegisterIdentifier(e.target.value); setLocalPageError(''); setRegisterSuccessMessage(''); }} error={!!localPageError && activeTab === 1 } helperText={activeTab === 1 && localPageError ? localPageError : ''} />
            <TextField margin="normal" required fullWidth id="register-email" label="Email Address" name="registerEmail" type="email" autoComplete="email" value={registerEmail} onChange={(e) => { setRegisterEmail(e.target.value); setLocalPageError(''); setRegisterSuccessMessage(''); }} error={!!localPageError && activeTab === 1 && (!/\S+@\S+\.\S+/.test(registerEmail) && registerEmail.length > 0)} helperText={activeTab === 1 && localPageError && (!/\S+@\S+\.\S+/.test(registerEmail) && registerEmail.length > 0) ? localPageError : ''}/>
            <TextField margin="normal" required fullWidth name="registerPassword" label="Password (min. 6 chars)" type="password" id="register-password" value={registerPassword} onChange={(e) => { setRegisterPassword(e.target.value); setLocalPageError(''); setRegisterSuccessMessage(''); }} error={!!localPageError && activeTab === 1 && registerPassword.length > 0 && registerPassword.length < 6} helperText={activeTab === 1 && localPageError && registerPassword.length > 0 && registerPassword.length < 6 ? localPageError : ''}/>
            <TextField margin="normal" required fullWidth name="registerConfirmNewPassword" label="Confirm New Password" type="password" id="register-confirm-password" value={registerConfirmPassword} onChange={(e) => { setRegisterConfirmPassword(e.target.value); setLocalPageError(''); setRegisterSuccessMessage('');}} error={(!!localPageError && activeTab === 1 ) || (registerPassword !== registerConfirmPassword && registerConfirmPassword.length > 0)} helperText={registerPassword !== registerConfirmPassword && registerConfirmPassword.length > 0 ? "Passwords do not match" : (activeTab === 1 && localPageError ? localPageError : "")}/>
            {registerSuccessMessage && <Alert severity="success" sx={{ mt: 2 }}>{registerSuccessMessage}</Alert>}
            <Button type="submit" fullWidth variant="contained" disabled={isSubmittingRegister} sx={{ mt: 3, mb: 2, backgroundColor: theme.palette.secondary.main, color: theme.palette.getContrastText(theme.palette.secondary.main), '&:hover': { backgroundColor: darken(theme.palette.secondary.main, 0.15) } }} startIcon={isSubmittingRegister ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}>
                {isSubmittingRegister ? 'Creating Account...' : 'Create Account'}
            </Button>
            </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default AccountPage;