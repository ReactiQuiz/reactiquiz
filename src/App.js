// src/App.js
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Toolbar } from '@mui/material'; // Import Toolbar
import { darkTheme } from './theme';
import AppDrawer from './components/AppDrawer';
import Footer from './components/Footer';
import NavBar from './components/Navbar';
import AppRoutes from './components/AppRoutes';
import apiClient from './api/axiosInstance';
import ChangePasswordModal from './components/ChangePasswordModal'; 

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  const isHomePage = location.pathname === '/';

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

  const handleLogout = () => { 
    setCurrentUser(null);
    localStorage.removeItem('reactiquizUser');
    localStorage.removeItem('reactiquizToken');
    delete apiClient.defaults.headers.common['Authorization'];
    setAuthError(''); 
    console.log("User logged out.");
    navigate('/'); 
  };

  const handleOpenChangePasswordModal = () => setChangePasswordModalOpen(true);
  const handleCloseChangePasswordModal = () => setChangePasswordModalOpen(false);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar
          onIconButtonClick={!isHomePage ? handleDrawerToggle : undefined}
          currentUser={currentUser}
          handleLogout={handleLogout} 
          onOpenChangePasswordModal={handleOpenChangePasswordModal} 
          showMenuIcon={!isHomePage}
          forceLoginButton={isHomePage}
        />
        {/* THIS IS THE FIX: Add a Toolbar component to act as a spacer */}
        <Toolbar /> 
        
        {!isHomePage && <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />}
        
        <AppRoutes
          currentUser={currentUser}
          handleLogout={handleLogout} 
          authError={authError} 
          setAuthError={setAuthError} 
          setCurrentUser={setCurrentUser} 
          onOpenChangePasswordModal={handleOpenChangePasswordModal}
        />
        <Footer />
      </Box>
      {currentUser && (
        <ChangePasswordModal
          open={changePasswordModalOpen}
          onClose={handleCloseChangePasswordModal}
          currentUser={currentUser}
        />
      )}
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