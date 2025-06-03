// src/pages/AccountPage.js
import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, CircularProgress, useTheme, Avatar,
  Tabs, Tab, Divider, Link as MuiLink, Grid, Stack, Skeleton
} from '@mui/material';
import { darken, alpha } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import LockResetIcon from '@mui/icons-material/LockReset';
import GroupIcon from '@mui/icons-material/Group';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import HomeIcon from '@mui/icons-material/Home';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import SchoolIcon from '@mui/icons-material/School';

import { useNavigate } from 'react-router-dom';

import apiClient from '../api/axiosInstance';
import ChangeDetailsModal from '../components/ChangeDetailsModal';

function AccountPage({
    currentUser,
    handleLogout,
    setAuthError,
    setCurrentUser,
    authError,
    onOpenChangePasswordModal
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const ACCENT_COLOR = theme.palette.accountAccent?.main || theme.palette.primary.main;

  const [activeTab, setActiveTab] = useState(0);
  // ... (other state variables remain the same as previous version) ...
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [showLoginOtpInput, setShowLoginOtpInput] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isSubmittingLoginOtp, setIsSubmittingLoginOtp] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');
  const [registerIdentifier, setRegisterIdentifier] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');
  const [registerClass, setRegisterClass] = useState('');
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState('');
  const [forgotPasswordStage, setForgotPasswordStage] = useState('idle');
  const [forgotPasswordIdentifier, setForgotPasswordIdentifier] = useState('');
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');
  const [forgotPasswordNewPassword, setForgotPasswordNewPassword] = useState('');
  const [forgotPasswordConfirmNewPassword, setForgotPasswordConfirmNewPassword] = useState('');
  const [isSubmittingForgotPassword, setIsSubmittingForgotPassword] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState({ type: '', text: ''});
  const [localPageError, setLocalPageError] = useState('');
  const [friendCount, setFriendCount] = useState(0);
  const [isLoadingFriendCount, setIsLoadingFriendCount] = useState(false);
  const [changeDetailsModalOpen, setChangeDetailsModalOpen] = useState(false);


  useEffect(() => {
    // ... (useEffect content remains the same) ...
    setLocalPageError('');
    setLoginSuccessMessage('');
    setRegisterSuccessMessage('');
    setForgotPasswordMessage({ type: '', text: ''});
    if(setAuthError) setAuthError('');

    if (!currentUser) {
        setLoginIdentifier(''); setLoginPassword(''); setShowLoginOtpInput(false); setLoginOtp('');
        setRegisterIdentifier(''); setRegisterEmail(''); setRegisterPassword(''); setRegisterConfirmPassword('');
        setRegisterAddress(''); setRegisterClass('');
        setForgotPasswordStage('idle'); setForgotPasswordIdentifier(''); setForgotPasswordOtp('');
        setForgotPasswordNewPassword(''); setForgotPasswordConfirmNewPassword('');
    } else {
        setIsLoadingFriendCount(true);
        apiClient.get('/api/friends', { headers: { Authorization: `Bearer ${currentUser.token}` } })
            .then(response => setFriendCount(response.data ? response.data.length : 0))
            .catch(error => { console.error("Error fetching friend count:", error); setFriendCount(0); })
            .finally(() => setIsLoadingFriendCount(false));
    }
  }, [activeTab, currentUser, setAuthError]);

  const handleOpenChangeDetailsModal = () => setChangeDetailsModalOpen(true);
  const handleCloseChangeDetailsModal = () => setChangeDetailsModalOpen(false);

  // ... (other handlers like handleTabChange, handleLoginSubmit, etc., remain the same) ...
  const handleTabChange = (event, newValue) => { setActiveTab(newValue); setShowLoginOtpInput(false); setLoginSuccessMessage(''); setRegisterSuccessMessage(''); setForgotPasswordStage('idle'); setForgotPasswordMessage({type: '', text: ''}); setLocalPageError(''); if(setAuthError) setAuthError(''); };
  const handleLoginSubmit = async (event) => { 
    event.preventDefault(); setLocalPageError(''); setLoginSuccessMessage(''); setShowLoginOtpInput(false); setLoginOtp('');
    if (!loginIdentifier.trim() || !loginPassword.trim()) { setLocalPageError('Username and password are required.'); return; }
    setIsSubmittingLogin(true);
    try {
      const response = await apiClient.post('/api/users/login', { identifier: loginIdentifier.trim(), password: loginPassword });
      setLoginSuccessMessage(response.data.message || "OTP has been sent to your email."); setShowLoginOtpInput(true); setLoginPassword('');
    } catch (error) { setLocalPageError(error.response?.data?.message || 'Login failed. Please check your credentials.'); setShowLoginOtpInput(false);
    } finally { setIsSubmittingLogin(false); }
  };
  const handleLoginOtpSubmit = async (event) => { 
    event.preventDefault(); setLocalPageError('');
    if (!loginOtp.trim() || loginOtp.length !== 6 || !/^\d+$/.test(loginOtp)) { setLocalPageError('Please enter a valid 6-digit OTP.'); return; }
    setIsSubmittingLoginOtp(true);
    const deviceId = await import('../utils/deviceId').then(mod => mod.getOrSetDeviceID());
    try {
      const response = await apiClient.post('/api/users/verify-otp', { identifier: loginIdentifier.trim(), otp: loginOtp.trim(), deviceIdFromClient: deviceId });
      if (response.data && response.data.user && response.data.token) {
        const userData = { id: response.data.user.id, name: response.data.user.name, email: response.data.user.email, address: response.data.user.address, class: response.data.user.class };
        setCurrentUser({ ...userData, token: response.data.token }); localStorage.setItem('reactiquizUser', JSON.stringify(userData)); localStorage.setItem('reactiquizToken', response.data.token); apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      } else { setLocalPageError(response.data.message || "OTP verification failed."); }
    } catch (error) { setLocalPageError(error.response?.data?.message || 'Error verifying OTP.');
    } finally { setIsSubmittingLoginOtp(false); }
  };
  const handleRegisterSubmit = async (event) => {
    event.preventDefault(); setLocalPageError(''); setRegisterSuccessMessage('');
    if (!registerIdentifier.trim() || !registerEmail.trim() || !registerPassword.trim() || !registerAddress.trim() || !registerClass.trim()) { setLocalPageError('All fields are required.'); return; }
    if (registerPassword !== registerConfirmPassword) { setLocalPageError('Passwords do not match.'); return; }
    if (registerPassword.length < 6) { setLocalPageError('Password must be at least 6 characters long.'); return; }
    if (!/\S+@\S+\.\S+/.test(registerEmail)) { setLocalPageError('Invalid email format.'); return; }
    if (isNaN(parseInt(registerClass)) || parseInt(registerClass) <= 0) { setLocalPageError('Class must be a valid positive number.'); return; }
    setIsSubmittingRegister(true);
    try {
      const response = await apiClient.post('/api/users/register', { identifier: registerIdentifier.trim(), email: registerEmail.trim().toLowerCase(), password: registerPassword, address: registerAddress.trim(), class: parseInt(registerClass) });
      setRegisterSuccessMessage(response.data.message || "Registration successful! Please switch to the Login tab."); setRegisterIdentifier(''); setRegisterEmail(''); setRegisterPassword(''); setRegisterConfirmPassword(''); setRegisterAddress(''); setRegisterClass('');
    } catch (error) { setLocalPageError(error.response?.data?.message || 'Registration failed.');
    } finally { setIsSubmittingRegister(false); }
  };
  const handleForgotPasswordLinkClick = () => { setForgotPasswordStage('enterIdentifier'); setLocalPageError(''); setLoginSuccessMessage(''); setShowLoginOtpInput(false); };
  const handleRequestResetOtp = async (event) => {
    event.preventDefault(); setForgotPasswordMessage({ type: '', text: '' });
    if (!forgotPasswordIdentifier.trim()) { setForgotPasswordMessage({ type: 'error', text: 'Please enter your username.' }); return; }
    setIsSubmittingForgotPassword(true);
    try {
      const response = await apiClient.post('/api/users/request-password-reset', { identifier: forgotPasswordIdentifier.trim() });
      setForgotPasswordMessage({ type: 'success', text: response.data.message || "If an account exists, an OTP has been sent."}); setForgotPasswordStage('enterOtp');
    } catch (error) { setForgotPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Failed to request OTP.' });
    } finally { setIsSubmittingForgotPassword(false); }
  };
  const handleResetPasswordWithOtp = async (event) => {
    event.preventDefault(); setForgotPasswordMessage({ type: '', text: '' });
    if (!forgotPasswordOtp.trim() || forgotPasswordOtp.length !== 6 || !/^\d+$/.test(forgotPasswordOtp)) { setForgotPasswordMessage({ type: 'error', text: 'Please enter a valid 6-digit OTP.' }); return; }
    if (!forgotPasswordNewPassword || !forgotPasswordConfirmNewPassword) { setForgotPasswordMessage({ type: 'error', text: 'New password and confirmation are required.' }); return; }
    if (forgotPasswordNewPassword.length < 6) { setForgotPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' }); return; }
    if (forgotPasswordNewPassword !== forgotPasswordConfirmNewPassword) { setForgotPasswordMessage({ type: 'error', text: 'New passwords do not match.' }); return; }
    setIsSubmittingForgotPassword(true);
    try {
        const response = await apiClient.post('/api/users/reset-password-with-otp', { identifier: forgotPasswordIdentifier.trim(), otp: forgotPasswordOtp.trim(), newPassword: forgotPasswordNewPassword });
        setForgotPasswordMessage({ type: 'success', text: response.data.message || "Password reset successfully. Please login." }); setForgotPasswordStage('idle'); setActiveTab(0); setForgotPasswordIdentifier(''); setForgotPasswordOtp(''); setForgotPasswordNewPassword(''); setForgotPasswordConfirmNewPassword('');
    } catch (error) { setForgotPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reset password.'});
    } finally { setIsSubmittingForgotPassword(false); }
  };


  if (currentUser) {
    return (
      <>
        <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Sidebar for User Info */}
            <Grid item xs={12} md={6}> {/* CHANGED lg={4} to md={6} */}
              <Paper elevation={3} sx={{ p: {xs: 1.5, sm: 2, md: 2.5}, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <Avatar
                  sx={{
                    width: { xs: 100, sm: 130, md: 160 },
                    height: { xs: 100, sm: 130, md: 160 },
                    mb: 1.5,
                    fontSize: { xs: '3rem', sm: '4rem', md: '4.5rem' },
                    bgcolor: ACCENT_COLOR,
                    color: theme.palette.getContrastText(ACCENT_COLOR)
                  }}
                  src={currentUser.profileImageUrl || ''}
                  alt={currentUser.name ? currentUser.name.charAt(0).toUpperCase() : ''}
                >
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <AccountCircleIcon sx={{fontSize: 'inherit'}}/>}
                </Avatar>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: ACCENT_COLOR, textAlign: 'center', fontSize: {xs: '1.2rem', sm: '1.5rem'} }}>
                  {currentUser.name}
                </Typography>
                {currentUser.email && (
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', wordBreak: 'break-word', fontSize: {xs: '0.8rem', sm: '0.9rem'}, mb: 0.5 }}>
                    {currentUser.email}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: 'center' }}>
                  <PeopleAltIcon sx={{ color: theme.palette.text.secondary, mr: 0.5, fontSize: {xs: '1rem', sm: '1.1rem'} }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: {xs: '0.8rem', sm: '0.875rem'} }}>
                    Friends: {isLoadingFriendCount ? <Skeleton variant="text" width={20} sx={{display: 'inline-block'}} /> : friendCount}
                  </Typography>
                </Box>
                {currentUser.class && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, justifyContent: 'center' }}>
                        <SchoolIcon sx={{ color: theme.palette.text.secondary, mr: 0.5, fontSize: {xs: '1rem', sm: '1.1rem'} }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: {xs: '0.8rem', sm: '0.875rem'} }}>
                            Class: {currentUser.class}{!isNaN(parseInt(currentUser.class)) && (parseInt(currentUser.class) % 10 === 1 && parseInt(currentUser.class) % 100 !== 11 ? 'st' : (parseInt(currentUser.class) % 10 === 2 && parseInt(currentUser.class) % 100 !== 12 ? 'nd' : (parseInt(currentUser.class) % 10 === 3 && parseInt(currentUser.class) % 100 !== 13 ? 'rd' : 'th')))}
                        </Typography>
                    </Box>
                )}
                {currentUser.address && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: {xs: '0.8rem', sm: '0.875rem'}, wordBreak: 'break-word' }}>
                      <HomeIcon sx={{ fontSize: {xs: '1rem', sm: '1.1rem'}, mr: 0.5, opacity: 0.7 }} />
                      {currentUser.address}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={onOpenChangePasswordModal}
                  startIcon={<VpnKeyIcon />}
                  sx={{
                    mt: 2,
                    py: {xs: 0.8, sm: 1},
                    fontSize: {xs: '0.8rem', sm: '0.875rem'},
                    borderColor: ACCENT_COLOR,
                    color: ACCENT_COLOR,
                    '&:hover': {
                      backgroundColor: alpha(ACCENT_COLOR, 0.08),
                      borderColor: darken(ACCENT_COLOR, 0.1)
                    }
                  }}
                >
                  Change Password
                </Button>
              </Paper>
            </Grid>

            {/* Main Content Area for Action Buttons */}
            <Grid item xs={12} md={6}> {/* CHANGED lg={8} to md={6} */}
              <Paper elevation={3} sx={{p: {xs: 1.5, sm: 2, md: 2.5}, height: '100%', display: 'flex', flexDirection: 'column'}}>
                <Typography variant="h6" gutterBottom sx={{color: theme.palette.text.secondary, mb: 1.5, fontSize: {xs: '1rem', sm: '1.125rem'} }}>
                  Account Actions
                </Typography>
                <Stack spacing={{xs: 1, sm: 1.5}} sx={{ flexGrow: 1 }}>
                  <Button fullWidth variant="contained" onClick={() => navigate('/friends')} startIcon={<GroupIcon />} sx={{ backgroundColor: theme.palette.friendsAccent?.main || theme.palette.info.main, color: theme.palette.getContrastText(theme.palette.friendsAccent?.main || theme.palette.info.main), '&:hover': { backgroundColor: darken(theme.palette.friendsAccent?.main || theme.palette.info.main, 0.2)}, py: {xs: 0.8, sm: 1}, fontSize: {xs: '0.8rem', sm: '0.875rem'} }}>
                      Manage Friends
                  </Button>
                  <Button fullWidth variant="contained" onClick={() => navigate('/challenges')} startIcon={<SportsKabaddiIcon />} sx={{ backgroundColor: theme.palette.challengesAccent?.main || theme.palette.secondary.main, color: theme.palette.getContrastText(theme.palette.challengesAccent?.main || theme.palette.secondary.main), '&:hover': { backgroundColor: darken(theme.palette.challengesAccent?.main || theme.palette.secondary.main, 0.2)}, py: {xs: 0.8, sm: 1}, fontSize: {xs: '0.8rem', sm: '0.875rem'} }}>
                      My Challenges
                  </Button>
                   <Button fullWidth variant="outlined" onClick={handleOpenChangeDetailsModal} startIcon={<SettingsIcon />} sx={{ borderColor: ACCENT_COLOR, color: ACCENT_COLOR, '&:hover': { backgroundColor: alpha(ACCENT_COLOR, 0.08)}, py: {xs: 0.8, sm: 1}, fontSize: {xs: '0.8rem', sm: '0.875rem'} }}>
                      Change Details
                  </Button>
                </Stack>
                <Button fullWidth variant="contained" color="error" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ py: {xs: 0.8, sm: 1}, mt: {xs: 1.5, sm: 2}, fontSize: {xs: '0.8rem', sm: '0.875rem'} }}>
                      Logout
                  </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        {currentUser && (
          <ChangeDetailsModal
            open={changeDetailsModalOpen}
            onClose={handleCloseChangeDetailsModal}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        )}
      </>
    );
  }

  const renderFormErrorMessage = (pageErr, apiErr) => { /* ... (no change) ... */
    if (pageErr) return <Alert severity="error" sx={{ mt: 2, mb:1 }}>{pageErr}</Alert>;
    if (apiErr) return <Alert severity="error" sx={{ mt: 2, mb:1 }}>{apiErr}</Alert>;
    return null;
  };

  return ( /* ... (Login/Register form unchanged) ... */
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '550px', margin: 'auto', mt: 3 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2, borderTop: `5px solid ${ACCENT_COLOR}` }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: ACCENT_COLOR, width: 60, height: 60 }}>
            <AccountCircleIcon sx={{ fontSize: '2.5rem' }}/>
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: ACCENT_COLOR }}>
            User Account
          </Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="login register tabs"
            variant="fullWidth"
            TabIndicatorProps={{ style: { backgroundColor: ACCENT_COLOR, height: 3 } }}
            sx={{
                '& .MuiTab-root': {
                    color: theme.palette.text.secondary,
                    fontWeight: 'medium',
                    fontSize: '1rem',
                    '&.Mui-selected': { color: ACCENT_COLOR, fontWeight: 'bold' }
                }
            }}
          >
            <Tab label="Login" id="login-tab" aria-controls="login-panel" />
            <Tab label="Create Account" id="register-tab" aria-controls="register-panel" />
          </Tabs>
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 0} id="login-panel" aria-labelledby="login-tab">
            {/* Login form content */}
            {forgotPasswordStage === 'idle' && !showLoginOtpInput && (
            <Box component="form" onSubmit={handleLoginSubmit} noValidate sx={{ mt: 1 }}>
                <TextField margin="normal" required fullWidth id="login-identifier" label="Username" name="loginIdentifier" autoComplete="username" autoFocus value={loginIdentifier} onChange={(e) => { setLoginIdentifier(e.target.value); setLocalPageError(''); if(setAuthError) setAuthError(''); setLoginSuccessMessage('');}} error={!!(localPageError || authError) && !loginSuccessMessage && activeTab === 0 } />
                <TextField margin="normal" required fullWidth name="loginPassword" label="Password" type="password" id="login-password" autoComplete="current-password" value={loginPassword} onChange={(e) => { setLoginPassword(e.target.value); setLocalPageError(''); if(setAuthError) setAuthError(''); setLoginSuccessMessage(''); }} error={!!(localPageError || authError) && !loginSuccessMessage && activeTab === 0 }/>
                {renderFormErrorMessage(localPageError, authError && !loginSuccessMessage && !showLoginOtpInput && forgotPasswordStage === 'idle' ? authError : '')}
                <Button type="submit" fullWidth variant="contained" disabled={isSubmittingLogin} sx={{ mt: 2, mb: 1, backgroundColor: ACCENT_COLOR, '&:hover': { backgroundColor: darken(ACCENT_COLOR, 0.2)}, py:1.2 }} startIcon={isSubmittingLogin ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}>
                {isSubmittingLogin ? 'Requesting OTP...' : 'Request OTP & Login'}
                </Button>
                <Box sx={{ textAlign: 'right', mt: 1 }}><MuiLink component="button" variant="body2" onClick={handleForgotPasswordLinkClick} sx={{cursor: 'pointer', color: ACCENT_COLOR, '&:hover': { textDecoration: 'underline' }}}>Forgot Password?</MuiLink></Box>
            </Box>
            )}
            {showLoginOtpInput && forgotPasswordStage === 'idle' && (
                <Box component="form" onSubmit={handleLoginOtpSubmit} noValidate sx={{ mt: 1 }}>
                {loginSuccessMessage && <Alert severity="success" sx={{ mb: 2 }}>{loginSuccessMessage}</Alert>}
                <Typography variant="body2" sx={{mb:1}}>Enter the OTP sent to your registered email for <strong>{loginIdentifier}</strong>.</Typography>
                <TextField margin="normal" required fullWidth id="login-otp" label="6-Digit OTP" name="loginOtp" type="tel" inputProps={{ maxLength: 6, pattern: "[0-9]*" }} value={loginOtp} onChange={(e) => { setLoginOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6)); setLocalPageError(''); if(setAuthError) setAuthError(''); }} error={!!(localPageError || authError) && activeTab === 0} />
                {renderFormErrorMessage(localPageError, authError && showLoginOtpInput ? authError : '')}
                <Button type="submit" fullWidth variant="contained" disabled={isSubmittingLoginOtp || loginOtp.length !== 6} sx={{ mt: 2, mb: 1, backgroundColor: theme.palette.success.main, '&:hover': { backgroundColor: darken(theme.palette.success.main, 0.2)}, py:1.2 }} startIcon={isSubmittingLoginOtp ? <CircularProgress size={20} color="inherit" /> : <VpnKeyIcon />}>
                    {isSubmittingLoginOtp ? 'Verifying...' : 'Verify OTP & Login'}
                </Button>
                <Button onClick={() => {setShowLoginOtpInput(false); setLoginSuccessMessage(''); setLocalPageError(''); if(setAuthError) setAuthError(''); setLoginOtp('');}} sx={{display:'block', margin: '0 auto', color: ACCENT_COLOR}}>Back to Username/Password</Button>
                </Box>
            )}
            {forgotPasswordStage === 'enterIdentifier' && (
            <Box component="form" onSubmit={handleRequestResetOtp} noValidate sx={{ mt: 1 }}>
                <Typography variant="h6" gutterBottom sx={{color: ACCENT_COLOR, textAlign: 'center', mb:1}}>Reset Password</Typography>
                <Typography variant="body2" sx={{mb:2, textAlign:'center'}}>Enter your username to receive a password reset OTP.</Typography>
                <TextField margin="normal" required fullWidth id="forgot-identifier" label="Username" name="forgotIdentifier" autoComplete="username" autoFocus value={forgotPasswordIdentifier} onChange={(e) => setForgotPasswordIdentifier(e.target.value)} error={!!forgotPasswordMessage.text && forgotPasswordMessage.type === 'error'}/>
                {forgotPasswordMessage.text && <Alert severity={forgotPasswordMessage.type} sx={{ mt: 2, mb:1 }}>{forgotPasswordMessage.text}</Alert>}
                <Button type="submit" fullWidth variant="contained" disabled={isSubmittingForgotPassword} sx={{ mt: 2, mb: 1, backgroundColor: ACCENT_COLOR, '&:hover': {backgroundColor: darken(ACCENT_COLOR, 0.2)}, py:1.2}} startIcon={isSubmittingForgotPassword ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}>
                    {isSubmittingForgotPassword ? 'Sending OTP...' : 'Send Reset OTP'}
                </Button>
                <Button onClick={() => {setForgotPasswordStage('idle'); setForgotPasswordMessage({ type: '', text: ''});}} fullWidth sx={{color: ACCENT_COLOR}}>Back to Login</Button>
            </Box>
            )}
            {forgotPasswordStage === 'enterOtp' && (
                <Box component="form" onSubmit={handleResetPasswordWithOtp} noValidate sx={{ mt: 1 }}>
                <Typography variant="h6" gutterBottom sx={{color: ACCENT_COLOR, textAlign: 'center', mb:1}}>Set New Password</Typography>
                {forgotPasswordMessage.type === 'success' && forgotPasswordMessage.text.toLowerCase().includes("otp has been sent") && <Alert severity="success" sx={{ mb: 2 }}>{forgotPasswordMessage.text}</Alert>}
                <Typography variant="body2" sx={{mb:1, textAlign:'center'}}>An OTP has been sent to the email associated with <strong>{forgotPasswordIdentifier}</strong>.</Typography>
                <TextField margin="normal" required fullWidth id="forgot-otp" label="6-Digit OTP" name="forgotOtp" type="tel" inputProps={{ maxLength: 6, pattern: "[0-9]*" }} value={forgotPasswordOtp} onChange={(e) => setForgotPasswordOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} error={!!forgotPasswordMessage.text && forgotPasswordMessage.type === 'error'}/>
                <TextField margin="normal" required fullWidth name="forgotNewPassword" label="New Password (min. 6 chars)" type="password" id="forgot-new-password" value={forgotPasswordNewPassword} onChange={(e) => setForgotPasswordNewPassword(e.target.value)} error={!!forgotPasswordMessage.text && forgotPasswordMessage.type === 'error'}/>
                <TextField margin="normal" required fullWidth name="forgotConfirmNewPassword" label="Confirm New Password" type="password" id="forgot-confirm-new-password" value={forgotPasswordConfirmNewPassword} onChange={(e) => setForgotPasswordConfirmNewPassword(e.target.value)} error={(!!forgotPasswordMessage.text && forgotPasswordMessage.type === 'error') || (forgotPasswordNewPassword !== forgotPasswordConfirmNewPassword && forgotPasswordConfirmNewPassword.length > 0)} helperText={forgotPasswordNewPassword !== forgotPasswordConfirmNewPassword && forgotPasswordConfirmNewPassword.length > 0 ? "Passwords do not match" : ""}/>
                {forgotPasswordMessage.type === 'error' && !forgotPasswordMessage.text.toLowerCase().includes("otp has been sent") && <Alert severity="error" sx={{ mt: 2, mb:1 }}>{forgotPasswordMessage.text}</Alert>}
                <Button type="submit" fullWidth variant="contained" disabled={isSubmittingForgotPassword || forgotPasswordOtp.length !== 6 || !forgotPasswordNewPassword} sx={{ mt: 2, mb: 1, backgroundColor: ACCENT_COLOR, '&:hover': {backgroundColor: darken(ACCENT_COLOR, 0.2)}, py:1.2}} startIcon={isSubmittingForgotPassword ? <CircularProgress size={20} color="inherit" /> : <LockResetIcon />}>
                    {isSubmittingForgotPassword ? 'Resetting...' : 'Reset Password'}
                </Button>
                <Button onClick={() => {setForgotPasswordStage('enterIdentifier'); setForgotPasswordMessage({ type: '', text: ''}); setForgotPasswordOtp('');}} fullWidth sx={{color: ACCENT_COLOR}}>Request OTP Again / Change Username</Button>
                </Box>
            )}
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 1} id="register-panel" aria-labelledby="register-tab">
             {/* Registration form content */}
            <Box component="form" onSubmit={handleRegisterSubmit} noValidate sx={{ mt: 1 }}>
            <TextField margin="normal" required fullWidth id="register-identifier" label="Username" name="registerIdentifier" autoComplete="username" autoFocus value={registerIdentifier} onChange={(e) => { setRegisterIdentifier(e.target.value); setLocalPageError(''); if(setAuthError) setAuthError(''); setRegisterSuccessMessage(''); }} error={!!(localPageError || authError) && activeTab === 1 } />
            <TextField margin="normal" required fullWidth id="register-email" label="Email Address" name="registerEmail" type="email" autoComplete="email" value={registerEmail} onChange={(e) => { setRegisterEmail(e.target.value); setLocalPageError(''); if(setAuthError) setAuthError(''); setRegisterSuccessMessage(''); }} error={!!(localPageError || authError) && activeTab === 1 && (!/\S+@\S+\.\S+/.test(registerEmail) && registerEmail.length > 0)} />
            <TextField margin="normal" required fullWidth name="registerPassword" label="Password (min. 6 chars)" type="password" id="register-password" value={registerPassword} onChange={(e) => { setRegisterPassword(e.target.value); setLocalPageError(''); if(setAuthError) setAuthError(''); setRegisterSuccessMessage(''); }} error={!!(localPageError || authError) && activeTab === 1 && registerPassword.length > 0 && registerPassword.length < 6} />
            <TextField margin="normal" required fullWidth name="registerConfirmPassword" label="Confirm Password" type="password" id="register-confirm-password" value={registerConfirmPassword} onChange={(e) => { setRegisterConfirmPassword(e.target.value); setLocalPageError(''); if(setAuthError) setAuthError('');}} error={(!!(localPageError || authError) && activeTab === 1 ) || (registerPassword !== registerConfirmPassword && registerConfirmPassword.length > 0)} helperText={registerPassword !== registerConfirmPassword && registerConfirmPassword.length > 0 ? "Passwords do not match" : ""} />
            <TextField margin="normal" required fullWidth id="register-address" label="Address" name="registerAddress" autoComplete="street-address" value={registerAddress} onChange={(e) => { setRegisterAddress(e.target.value); setLocalPageError(''); if(setAuthError) setAuthError(''); }} error={!!(localPageError || authError) && activeTab === 1 && !registerAddress.trim()} />
            <TextField margin="normal" required fullWidth id="register-class" label="Class (e.g., 6, 9, 12)" name="registerClass" type="number" inputProps={{ min: 1, step: 1 }} value={registerClass} onChange={(e) => { setRegisterClass(e.target.value); setLocalPageError(''); if(setAuthError) setAuthError(''); }} error={!!(localPageError || authError) && activeTab === 1 && (isNaN(parseInt(registerClass)) || parseInt(registerClass) <=0)} />
            {renderFormErrorMessage(localPageError, authError && activeTab === 1 ? authError : '')}
            {registerSuccessMessage && <Alert severity="success" sx={{ mt: 2, mb:1 }}>{registerSuccessMessage}</Alert>}
            <Button type="submit" fullWidth variant="contained" disabled={isSubmittingRegister} sx={{ mt: 2, mb: 1, backgroundColor: ACCENT_COLOR, color: theme.palette.getContrastText(ACCENT_COLOR), '&:hover': { backgroundColor: darken(ACCENT_COLOR, 0.2) }, py:1.2 }} startIcon={isSubmittingRegister ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}>
                {isSubmittingRegister ? 'Creating Account...' : 'Create Account'}
            </Button>
            </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default AccountPage;