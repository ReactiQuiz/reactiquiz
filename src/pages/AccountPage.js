// src/pages/AccountPage.js
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, CircularProgress, useTheme, Avatar,
  Tabs, Tab, Divider, Link as MuiLink, Grid, Stack
} from '@mui/material';
import { darken, alpha } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import LockResetIcon from '@mui/icons-material/LockReset';
import GroupIcon from '@mui/icons-material/Group';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import EventNoteIcon from '@mui/icons-material/EventNote';

import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import ChangeDetailsModal from '../components/auth/ChangeDetailsModal';
import UserActivityChart from '../components/account/UserActivityChart';
import { useAuth } from '../contexts/AuthContext';

import UserProfileCard from '../components/account/UserProfileCard';
import AccountManagementActions from '../components/account/AccountManagementActions';

// formatUserClass is now inside UserProfileCard.js, assuming it's not needed directly here.
// If it were, you'd define or import it.

function AccountPage({
    authError,
    setAuthError,
    onOpenChangePasswordModal
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser, login, logout } = useAuth();
  const ACCENT_COLOR = theme.palette.accountAccent?.main || theme.palette.primary.main;

  // --- State for Login/Register/Forgot Password forms ---
  const [activeTab, setActiveTab] = useState(0);
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
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState({ type: '', text: '' });
  const [localPageError, setLocalPageError] = useState('');

  // --- State for ChangeDetailsModal ---
  const [changeDetailsModalOpen, setChangeDetailsModalOpen] = useState(false);

  // --- State for User Stats ---
  const [userStats, setUserStats] = useState({
    totalQuizzesSolved: 0,
    overallAveragePercentage: 0,
    activityData: [],
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  const fetchUserAccountStats = useCallback(async () => {
    if (!currentUser || !currentUser.token) {
      setUserStats({ totalQuizzesSolved: 0, overallAveragePercentage: 0, activityData: [] });
      return;
    }
    setIsLoadingStats(true);
    setStatsError('');
    try {
      const response = await apiClient.get('/api/users/stats', {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setUserStats({
        totalQuizzesSolved: response.data.totalQuizzesSolved || 0,
        overallAveragePercentage: response.data.overallAveragePercentage || 0,
        activityData: response.data.activityData || [],
      });
    } catch (error) {
      console.error("Error fetching user account stats:", error);
      setStatsError(error.response?.data?.message || "Failed to load your statistics.");
      setUserStats({ totalQuizzesSolved: 0, overallAveragePercentage: 0, activityData: [] });
    } finally {
      setIsLoadingStats(false);
    }
  }, [currentUser]);

  useEffect(() => {
    setLocalPageError('');
    setLoginSuccessMessage('');
    setRegisterSuccessMessage('');
    setForgotPasswordMessage({ type: '', text: '' });
    if (setAuthError) setAuthError('');

    if (!currentUser) {
      setActiveTab(0);
      setLoginIdentifier(''); setLoginPassword(''); setShowLoginOtpInput(false); setLoginOtp('');
      setRegisterIdentifier(''); setRegisterEmail(''); setRegisterPassword(''); setRegisterConfirmPassword('');
      setRegisterAddress(''); setRegisterClass('');
      setForgotPasswordStage('idle'); setForgotPasswordIdentifier(''); setForgotPasswordOtp('');
      setForgotPasswordNewPassword(''); setForgotPasswordConfirmNewPassword('');
      setUserStats({ totalQuizzesSolved: 0, overallAveragePercentage: 0, activityData: [] });
      setIsLoadingStats(false);
      setStatsError('');
    } else {
      fetchUserAccountStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUser, setAuthError]);

  const handleOpenChangeDetailsModal = () => setChangeDetailsModalOpen(true);
  const handleCloseChangeDetailsModal = () => setChangeDetailsModalOpen(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setShowLoginOtpInput(false); setLoginSuccessMessage(''); setRegisterSuccessMessage('');
    setForgotPasswordStage('idle'); setForgotPasswordMessage({ type: '', text: '' });
    setLocalPageError(''); if (setAuthError) setAuthError('');
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLocalPageError(''); setLoginSuccessMessage(''); setShowLoginOtpInput(false); setLoginOtp(''); if(setAuthError) setAuthError('');
    if (!loginIdentifier.trim() || !loginPassword.trim()) { setLocalPageError('Username and password are required.'); return; }
    setIsSubmittingLogin(true);
    try {
      const response = await apiClient.post('/api/users/login', { identifier: loginIdentifier.trim(), password: loginPassword });
      setLoginSuccessMessage(response.data.message || "OTP has been sent to your email.");
      setShowLoginOtpInput(true); setLoginPassword('');
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(errMsg); setLocalPageError(errMsg); setShowLoginOtpInput(false);
    } finally { setIsSubmittingLogin(false); }
  };

  const handleLoginOtpSubmit = async (event) => {
    event.preventDefault();
    setLocalPageError(''); if(setAuthError) setAuthError('');
    if (!loginOtp.trim() || loginOtp.length !== 6 || !/^\d+$/.test(loginOtp)) { setLocalPageError('Please enter a valid 6-digit OTP.'); return; }
    setIsSubmittingLoginOtp(true);
    const deviceId = await import('../utils/deviceId').then(mod => mod.getOrSetDeviceID());
    try {
      const response = await apiClient.post('/api/users/verify-otp', { identifier: loginIdentifier.trim(), otp: loginOtp.trim(), deviceIdFromClient: deviceId });
      if (response.data && response.data.user && response.data.token) {
        login(response.data.user, response.data.token);
      } else {
        const errMsg = response.data.message || "OTP verification failed.";
        setAuthError(errMsg); setLocalPageError(errMsg);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Error verifying OTP.';
      setAuthError(errMsg); setLocalPageError(errMsg);
    } finally { setIsSubmittingLoginOtp(false); }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault(); setLocalPageError(''); setRegisterSuccessMessage(''); if(setAuthError) setAuthError('');
    if (!registerIdentifier.trim() || !registerEmail.trim() || !registerPassword.trim() || !registerAddress.trim() || !registerClass.trim()) { setLocalPageError('All fields are required.'); return; }
    if (registerPassword !== registerConfirmPassword) { setLocalPageError('Passwords do not match.'); return; }
    if (registerPassword.length < 6) { setLocalPageError('Password must be at least 6 characters long.'); return; }
    if (!/\S+@\S+\.\S+/.test(registerEmail)) { setLocalPageError('Invalid email format.'); return; }
    const classNum = parseInt(registerClass);
    if (isNaN(classNum) || classNum <= 0 || classNum > 12) { setLocalPageError('Class must be a valid number (e.g., 6-12).'); return; }
    setIsSubmittingRegister(true);
    try {
      const response = await apiClient.post('/api/users/register', { identifier: registerIdentifier.trim(), email: registerEmail.trim().toLowerCase(), password: registerPassword, address: registerAddress.trim(), class: String(classNum) });
      setRegisterSuccessMessage(response.data.message || "Registration successful! Please switch to the Login tab.");
      setRegisterIdentifier(''); setRegisterEmail(''); setRegisterPassword(''); setRegisterConfirmPassword(''); setRegisterAddress(''); setRegisterClass('');
      setActiveTab(0);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed.';
      setAuthError(errMsg); setLocalPageError(errMsg);
    } finally { setIsSubmittingRegister(false); }
  };

  const handleForgotPasswordLinkClick = () => { setForgotPasswordStage('enterIdentifier'); setLocalPageError(''); setLoginSuccessMessage(''); setShowLoginOtpInput(false); if(setAuthError) setAuthError(''); };

  const handleRequestResetOtp = async (event) => {
    event.preventDefault(); setForgotPasswordMessage({ type: '', text: '' }); if(setAuthError) setAuthError('');
    if (!forgotPasswordIdentifier.trim()) { setForgotPasswordMessage({ type: 'error', text: 'Please enter your username.' }); return; }
    setIsSubmittingForgotPassword(true);
    try {
      const response = await apiClient.post('/api/users/request-password-reset', { identifier: forgotPasswordIdentifier.trim() });
      setForgotPasswordMessage({ type: 'success', text: response.data.message || "If an account exists, an OTP has been sent."});
      setForgotPasswordStage('enterOtp');
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to request OTP.';
      setAuthError(errMsg); setForgotPasswordMessage({ type: 'error', text: errMsg });
    } finally { setIsSubmittingForgotPassword(false); }
  };

  const handleResetPasswordWithOtp = async (event) => {
    event.preventDefault(); setForgotPasswordMessage({ type: '', text: '' }); if(setAuthError) setAuthError('');
    if (!forgotPasswordOtp.trim() || forgotPasswordOtp.length !== 6 || !/^\d+$/.test(forgotPasswordOtp)) { setForgotPasswordMessage({ type: 'error', text: 'Please enter a valid 6-digit OTP.' }); return; }
    if (!forgotPasswordNewPassword || !forgotPasswordConfirmNewPassword) { setForgotPasswordMessage({ type: 'error', text: 'New password and confirmation are required.' }); return; }
    if (forgotPasswordNewPassword.length < 6) { setForgotPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' }); return; }
    if (forgotPasswordNewPassword !== forgotPasswordConfirmNewPassword) { setForgotPasswordMessage({ type: 'error', text: 'New passwords do not match.' }); return; }
    setIsSubmittingForgotPassword(true);
    try {
        const response = await apiClient.post('/api/users/reset-password-with-otp', { identifier: forgotPasswordIdentifier.trim(), otp: forgotPasswordOtp.trim(), newPassword: forgotPasswordNewPassword });
        setForgotPasswordMessage({ type: 'success', text: response.data.message || "Password reset successfully. Please login." });
        setForgotPasswordStage('idle'); setActiveTab(0);
        setLoginIdentifier(forgotPasswordIdentifier);
        setForgotPasswordIdentifier(''); setForgotPasswordOtp(''); setForgotPasswordNewPassword(''); setForgotPasswordConfirmNewPassword('');
    } catch (error) {
        const errMsg = error.response?.data?.message || 'Failed to reset password.';
        setAuthError(errMsg); setForgotPasswordMessage({ type: 'error', text: errMsg});
    } finally { setIsSubmittingForgotPassword(false); }
  };


  // --- Logged-in View ---
  if (currentUser) {
    return (
      <>
        <Box sx={{
          width: '100%',
          p: { xs: 1, sm: 1, md: 2, lg: 3 }, // Use your defined padding
          backgroundColor: theme.palette.background.default,
          margin: '0 auto'
          // No maxWidth here, to allow Grid to manage based on viewport if preferred
        }}>
          {/* Main Grid Container */}
          <Grid container> {/* Removed spacing prop, handle with item margins/padding or sx */}

            {/* === Left Column (Profile Info Card) === */}
            <Grid item
              sx={{
                // Your exact responsive width logic
                width: { xs: '100%', sm: '100%', md: '24.5%', lg: '24.5%', xl: '24.5%' },
                // Your exact responsive margin logic
                marginLeft: { xs: '0%', sm: '0%', md: '0%', lg: '2%', xl: '2%' },
                paddingRight: { md: '1%', lg: '1%', xl: '1%'}, // For the gap on desktop
                marginBottom: { xs: 2, sm: 2, md: 0 } // Margin bottom on mobile when stacked
              }}
            >
              <UserProfileCard
                currentUser={currentUser}
                userStats={userStats}
                isLoadingStats={isLoadingStats}
                statsError={statsError}
                onEditDetailsClick={handleOpenChangeDetailsModal}
                onLogoutClick={logout}
                accentColor={ACCENT_COLOR}
              />
            </Grid>

            {/* === Right Column (Account Management & Quiz Activity) === */}
            <Grid item
              sx={{
                // Your exact responsive width logic
                width: { xs: '100%', sm: '100%', md: '74.5%', lg: '72.5%', xl: '72.5%' }, // Adjusted slightly for potential lg margin on left
                 marginLeft: { xs: '0%', sm: '0%', md: '0%', lg: '0%', xl: '0%' }, // No left margin if left column already has right margin
              }}
            >
              <Stack spacing={{ xs: 2, md: 3 }} width={'100%'}>
                <AccountManagementActions
                  onOpenChangePasswordModal={onOpenChangePasswordModal}
                  onOpenChangeDetailsModal={handleOpenChangeDetailsModal}
                  accentColor={ACCENT_COLOR}
                />
                <Paper elevation={3} sx={{ p: {xs:1.5, sm:2, md:3}, borderTop: `3px solid ${theme.palette.info.main}`, width: '100%', boxSizing: 'border-box', borderRadius: { xs: 0, sm: theme.shape.borderRadius }}}>
                  <Typography variant="h6" gutterBottom sx={{color: theme.palette.text.secondary, fontWeight:'medium', display: 'flex', alignItems: 'center', fontSize: {xs:'1rem', sm:'1.125rem'} }}>
                    <BarChartIcon sx={{mr:1, color: theme.palette.info.light}}/> Quiz Activity (Last Year)
                  </Typography>
                  {isLoadingStats ? ( <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <CircularProgress sx={{color: theme.palette.info.main}}/> </Box> )
                   : statsError ? ( <Alert severity="warning" sx={{mt:1, fontSize: '0.8rem'}}>{`Could not load activity: ${statsError}`}</Alert> )
                   : userStats.activityData && userStats.activityData.length > 0 ? ( <UserActivityChart activityData={userStats.activityData} accentColor={ACCENT_COLOR} /> )
                   : ( <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(theme.palette.background.default, 0.5), borderRadius:1 }}> <Typography color="text.secondary" sx={{fontSize: '0.875rem'}}>No quiz activity recorded yet.</Typography> </Box> )}
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <ChangeDetailsModal
          open={changeDetailsModalOpen}
          onClose={handleCloseChangeDetailsModal}
        />
      </>
    );
  }

  // --- LOGIN/REGISTER/FORGOT PASSWORD FORMS ---
  const renderFormErrorMessage = (pageErr, apiErr) => {
    const errorToDisplay = pageErr || apiErr;
    if (errorToDisplay) return <Alert severity="error" sx={{ mt: 2, mb: 1 }}>{errorToDisplay}</Alert>;
    return null;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '550px', margin: 'auto', mt: 3 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2, borderTop: `5px solid ${ACCENT_COLOR}` }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: ACCENT_COLOR, width: 60, height: 60 }}>
            <AccountCircleIcon sx={{ fontSize: '2.5rem' }} />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: ACCENT_COLOR }}>
            User Account
          </Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="login register tabs" variant="fullWidth" TabIndicatorProps={{ style: { backgroundColor: ACCENT_COLOR, height: 3 } }} sx={{ '& .MuiTab-root': { color: theme.palette.text.secondary, fontWeight: 'medium', fontSize: '1rem', '&.Mui-selected': { color: ACCENT_COLOR, fontWeight: 'bold' } } }}>
            <Tab label="Login" id="login-tab" aria-controls="login-panel" />
            <Tab label="Create Account" id="register-tab" aria-controls="register-panel" />
          </Tabs>
        </Box>

        {/* Login Panel (Copied from your provided code) */}
        <Box role="tabpanel" hidden={activeTab !== 0} id="login-panel" aria-labelledby="login-tab">
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
            {showLoginOtpInput && forgotPasswordStage === 'idle' && ( <Box component="form" onSubmit={handleLoginOtpSubmit} noValidate sx={{ mt: 1 }}> {loginSuccessMessage && <Alert severity="success" sx={{ mb: 2 }}>{loginSuccessMessage}</Alert>} <Typography variant="body2" sx={{mb:1}}>Enter the OTP sent to your registered email for <strong>{loginIdentifier}</strong>.</Typography> <TextField margin="normal" required fullWidth id="login-otp" label="6-Digit OTP" name="loginOtp" type="tel" inputProps={{ maxLength: 6, pattern: "[0-9]*" }} value={loginOtp} onChange={(e) => { setLoginOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6)); setLocalPageError(''); if(setAuthError) setAuthError(''); }} error={!!(localPageError || authError) && activeTab === 0} /> {renderFormErrorMessage(localPageError, authError && showLoginOtpInput ? authError : '')} <Button type="submit" fullWidth variant="contained" disabled={isSubmittingLoginOtp || loginOtp.length !== 6} sx={{ mt: 2, mb: 1, backgroundColor: theme.palette.success.main, '&:hover': { backgroundColor: darken(theme.palette.success.main, 0.2)}, py:1.2 }} startIcon={isSubmittingLoginOtp ? <CircularProgress size={20} color="inherit" /> : <VpnKeyIcon />}> {isSubmittingLoginOtp ? 'Verifying...' : 'Verify OTP & Login'} </Button> <Button onClick={() => {setShowLoginOtpInput(false); setLoginSuccessMessage(''); setLocalPageError(''); if(setAuthError) setAuthError(''); setLoginOtp('');}} sx={{display:'block', margin: '0 auto', color: ACCENT_COLOR}}>Back to Username/Password</Button> </Box> )}
            {forgotPasswordStage === 'enterIdentifier' && ( <Box component="form" onSubmit={handleRequestResetOtp} noValidate sx={{ mt: 1 }}> <Typography variant="h6" gutterBottom sx={{color: ACCENT_COLOR, textAlign: 'center', mb:1}}>Reset Password</Typography> <Typography variant="body2" sx={{mb:2, textAlign:'center'}}>Enter your username to receive a password reset OTP.</Typography> <TextField margin="normal" required fullWidth id="forgot-identifier" label="Username" name="forgotIdentifier" autoComplete="username" autoFocus value={forgotPasswordIdentifier} onChange={(e) => setForgotPasswordIdentifier(e.target.value)} error={!!forgotPasswordMessage.text && forgotPasswordMessage.type === 'error'}/> {forgotPasswordMessage.text && <Alert severity={forgotPasswordMessage.type} sx={{ mt: 2, mb:1 }}>{forgotPasswordMessage.text}</Alert>} <Button type="submit" fullWidth variant="contained" disabled={isSubmittingForgotPassword} sx={{ mt: 2, mb: 1, backgroundColor: ACCENT_COLOR, '&:hover': {backgroundColor: darken(ACCENT_COLOR, 0.2)}, py:1.2}} startIcon={isSubmittingForgotPassword ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}> {isSubmittingForgotPassword ? 'Sending OTP...' : 'Send Reset OTP'} </Button> <Button onClick={() => {setForgotPasswordStage('idle'); setForgotPasswordMessage({ type: '', text: ''});}} fullWidth sx={{color: ACCENT_COLOR}}>Back to Login</Button> </Box> )}
            {forgotPasswordStage === 'enterOtp' && ( <Box component="form" onSubmit={handleResetPasswordWithOtp} noValidate sx={{ mt: 1 }}> <Typography variant="h6" gutterBottom sx={{color: ACCENT_COLOR, textAlign: 'center', mb:1}}>Set New Password</Typography> {forgotPasswordMessage.type === 'success' && forgotPasswordMessage.text.toLowerCase().includes("otp has been sent") && <Alert severity="success" sx={{ mb: 2 }}>{forgotPasswordMessage.text}</Alert>} <Typography variant="body2" sx={{mb:1, textAlign:'center'}}>An OTP has been sent to the email associated with <strong>{forgotPasswordIdentifier}</strong>.</Typography> <TextField margin="normal" required fullWidth id="forgot-otp" label="6-Digit OTP" name="forgotOtp" type="tel" inputProps={{ maxLength: 6, pattern: "[0-9]*" }} value={forgotPasswordOtp} onChange={(e) => setForgotPasswordOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} error={!!forgotPasswordMessage.text && forgotPasswordMessage.type === 'error'}/> <TextField margin="normal" required fullWidth name="forgotNewPassword" label="New Password (min. 6 chars)" type="password" id="forgot-new-password" value={forgotPasswordNewPassword} onChange={(e) => setForgotPasswordNewPassword(e.target.value)} error={!!forgotPasswordMessage.text && forgotPasswordMessage.type === 'error'}/> <TextField margin="normal" required fullWidth name="forgotConfirmNewPassword" label="Confirm New Password" type="password" id="forgot-confirm-new-password" value={forgotPasswordConfirmNewPassword} onChange={(e) => setForgotPasswordConfirmNewPassword(e.target.value)} error={(!!forgotPasswordMessage.text && forgotPasswordMessage.type === 'error') || (forgotPasswordNewPassword !== forgotPasswordConfirmNewPassword && forgotPasswordConfirmNewPassword.length > 0)} helperText={forgotPasswordNewPassword !== forgotPasswordConfirmNewPassword && forgotPasswordConfirmNewPassword.length > 0 ? "Passwords do not match" : ""}/> {forgotPasswordMessage.type === 'error' && !forgotPasswordMessage.text.toLowerCase().includes("otp has been sent") && <Alert severity="error" sx={{ mt: 2, mb:1 }}>{forgotPasswordMessage.text}</Alert>} <Button type="submit" fullWidth variant="contained" disabled={isSubmittingForgotPassword || forgotPasswordOtp.length !== 6 || !forgotPasswordNewPassword} sx={{ mt: 2, mb: 1, backgroundColor: ACCENT_COLOR, '&:hover': {backgroundColor: darken(ACCENT_COLOR, 0.2)}, py:1.2}} startIcon={isSubmittingForgotPassword ? <CircularProgress size={20} color="inherit" /> : <LockResetIcon />}> {isSubmittingForgotPassword ? 'Resetting...' : 'Reset Password'} </Button> <Button onClick={() => {setForgotPasswordStage('enterIdentifier'); setForgotPasswordMessage({ type: '', text: ''}); setForgotPasswordOtp('');}} fullWidth sx={{color: ACCENT_COLOR}}>Request OTP Again / Change Username</Button> </Box> )}
        </Box>

        {/* Register Panel (Copied from your provided code) */}
        <Box role="tabpanel" hidden={activeTab !== 1} id="register-panel" aria-labelledby="register-tab">
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