// src/App.js
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { darkTheme } from './theme';
import AppDrawer from './components/AppDrawer';
import Footer from './components/Footer';
import NavBar from './components/Navbar';
import AppRoutes from './components/AppRoutes';
import LoginModal from './components/LoginModal';
import apiClient from './api/axiosInstance';
import { getOrSetDeviceID } from './utils/deviceId';

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [deviceChangeInfo, setDeviceChangeInfo] = useState({
    showPrompt: false,
    showOtpInput: false,
    maskedEmail: null,
    identifierForChange: null,
    otpSentMessage: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('reactiquizUser');
    const savedToken = localStorage.getItem('reactiquizToken');
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser({ ...user, token: savedToken });
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (e) {
        console.error("Error parsing saved user from localStorage", e);
        localStorage.removeItem('reactiquizUser');
        localStorage.removeItem('reactiquizToken');
      }
    }
  }, []);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleLogin = async (identifier, recoveryEmail = null) => {
    // ... (same as previous full code response)
    setAuthError('');
    setDeviceChangeInfo({ showPrompt: false, showOtpInput: false, maskedEmail: null, identifierForChange: null, otpSentMessage: '' });
    const deviceIdFromClient = getOrSetDeviceID();

    try {
      const payload = { identifier, deviceIdFromClient };
      if (recoveryEmail) payload.recoveryEmail = recoveryEmail;

      const response = await apiClient.post('/api/users/auth', payload);

      if (response.data && response.data.user && response.data.token) {
        const userData = { id: response.data.user.id, name: response.data.user.name, recoveryEmail: response.data.user.recoveryEmail };
        setCurrentUser({ ...userData, token: response.data.token });
        localStorage.setItem('reactiquizUser', JSON.stringify(userData));
        localStorage.setItem('reactiquizToken', response.data.token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setLoginModalOpen(false);
        return { success: true, user: userData };
      } else {
        setAuthError(response.data.message || 'Login failed.');
        return { success: false, message: response.data.message || 'Login failed.' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during login/registration.';
      const errorCode = error.response?.data?.errorCode;
      const maskedEmail = error.response?.data?.recoveryEmailMasked;

      if (errorCode === 'DEVICE_MISMATCH') {
        setDeviceChangeInfo({
          showPrompt: true,
          showOtpInput: false,
          maskedEmail: maskedEmail,
          identifierForChange: identifier,
          otpSentMessage: '',
        });
        setAuthError(errorMessage);
      } else if (errorCode === 'EMAIL_REQUIRED' || errorCode === 'EMAIL_REQUIRED_FOR_DEVICE_LINK') {
        setAuthError(errorMessage);
      } else {
        setAuthError(errorMessage);
      }
      return { success: false, message: errorMessage, errorCode };
    }
  };

  const handleLogout = () => { // This function will now be passed down
    setCurrentUser(null);
    localStorage.removeItem('reactiquizUser');
    localStorage.removeItem('reactiquizToken');
    delete apiClient.defaults.headers.common['Authorization'];
    setDeviceChangeInfo({ showPrompt: false, showOtpInput: false, maskedEmail: null, identifierForChange: null, otpSentMessage: '' }); // Reset device change state
    setAuthError(''); // Clear any auth errors
    console.log("User logged out.");
    navigate('/'); // Redirect to home on logout
  };

  const handleCloseLoginModal = () => setLoginModalOpen(false);

  const requestDeviceChangeOtp = async (identifierToChange) => {
    // ... (same as previous full code response)
    if (!identifierToChange) {
      setAuthError("Identifier missing for device change request.");
      return { success: false, message: "Identifier missing." };
    }
    setAuthError('');
    try {
      const response = await apiClient.post('/api/users/request-device-change', { identifier: identifierToChange });
      setDeviceChangeInfo(prev => ({ ...prev, showOtpInput: true, otpSentMessage: response.data.message }));
      return { success: true, message: response.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to request OTP for device change.";
      setAuthError(msg);
      setDeviceChangeInfo(prev => ({ ...prev, showOtpInput: false, otpSentMessage: '' }));
      return { success: false, message: msg };
    }
  };

  const confirmDeviceWithOtp = async (identifier, otp) => {
    // ... (same as previous full code response)
    setAuthError('');
    const newDeviceId = getOrSetDeviceID();
    try {
      const response = await apiClient.post('/api/users/confirm-device-change-otp', { identifier, otp, newDeviceId });
      if (response.data && response.data.user && response.data.token) {
        const userData = { id: response.data.user.id, name: response.data.user.name, recoveryEmail: response.data.user.recoveryEmail };
        setCurrentUser({ ...userData, token: response.data.token });
        localStorage.setItem('reactiquizUser', JSON.stringify(userData));
        localStorage.setItem('reactiquizToken', response.data.token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setLoginModalOpen(false);
        setDeviceChangeInfo({ showPrompt: false, showOtpInput: false, maskedEmail: null, identifierForChange: null, otpSentMessage: '' });
        return { success: true, user: userData };
      } else {
        setAuthError(response.data.message || "Device confirmation failed.");
        return { success: false, message: response.data.message || "Device confirmation failed." };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Error confirming device with OTP.";
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar
          onIconButtonClick={handleDrawerToggle}
          currentUser={currentUser}
        // onLoginClick prop now primarily for Account page navigation if Login button is clicked when not logged in
        // The modal opening is handled separately by AccountPage/LoginModal for specific flows
        />
        <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />
        <AppRoutes
          currentUser={currentUser}
          handleLogin={handleLogin}
          handleLogout={handleLogout} // Pass handleLogout
          authError={authError}
          setAuthError={setAuthError}
          deviceChangeInfo={deviceChangeInfo}
          setDeviceChangeInfo={setDeviceChangeInfo}
          requestDeviceChangeOtp={requestDeviceChangeOtp}
          confirmDeviceWithOtp={confirmDeviceWithOtp}
        // setCurrentUser={setCurrentUser} // No longer strictly needed by ConfirmDevicePage if App.js handles it
        />
        <Footer />
      </Box>
      <LoginModal // This modal is now more for specific prompts like device change from Navbar
        open={loginModalOpen}
        onClose={handleCloseLoginModal}
        onLogin={handleLogin}
        accentColor={darkTheme.palette.primary.main}
        authError={authError}
        setAuthError={setAuthError}
        deviceChangeInfo={deviceChangeInfo}
        setDeviceChangeInfo={setDeviceChangeInfo}
        requestDeviceChangeOtp={requestDeviceChangeOtp}
        confirmDeviceWithOtp={confirmDeviceWithOtp}
      />
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;