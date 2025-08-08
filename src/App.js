// src/App.js
import { useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { CssBaseline, Box, Toolbar, ThemeProvider } from '@mui/material';
import { AppThemeProvider } from './contexts/ThemeContext';
import { SubjectColorsProvider } from './contexts/SubjectColorsContext';
import { TopicsProvider } from './contexts/TopicsContext';
import AppDrawer from './components/core/AppDrawer';
import Footer from './components/core/Footer';
import NavBar from './components/core/Navbar';
import AppRoutes from './components/AppRoutes';
import ChangePasswordModal from './components/auth/ChangePasswordModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProviders } from './contexts/AppProviders'; 
import NotificationManager from './components/core/NotificationManager'; 
import { darkTheme } from './theme'; // Import darkTheme for the guest layout

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleOpenChangePasswordModal = () => setChangePasswordModalOpen(true);
  const handleCloseChangePasswordModal = () => setChangePasswordModalOpen(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  // --- START OF NEW LOGIC: Check for guest on About page ---
  const isGuestOnAboutPage = location.pathname === '/about' && !currentUser;
  // --- END OF NEW LOGIC ---

  if (isAuthPage) {
    return <AppRoutes onOpenChangePasswordModal={handleOpenChangePasswordModal} />;
  }

  // --- START OF NEW LOGIC: Render minimal layout for guest on About page ---
  if (isGuestOnAboutPage) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* We use a simple ThemeProvider here because the main one is inside the other layout */}
        <ThemeProvider theme={darkTheme}> 
          <CssBaseline />
          {/* A minimal Navbar with no drawer toggle */}
          <NavBar /> 
          <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Toolbar />
            <AppRoutes onOpenChangePasswordModal={handleOpenChangePasswordModal} />
          </Box>
          <Footer />
        </ThemeProvider>
      </Box>
    );
  }
  // --- END OF NEW LOGIC ---

  // Full app layout for all other cases
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar
        onIconButtonClick={handleDrawerToggle}
        onOpenChangePasswordModal={handleOpenChangePasswordModal}
      />
      <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        <AppRoutes onOpenChangePasswordModal={handleOpenChangePasswordModal} />
      </Box>
      <Footer />
      {currentUser && (
        <ChangePasswordModal
          open={changePasswordModalOpen}
          onClose={handleCloseChangePasswordModal}
        />
      )}
    </Box>
  );
}

function App() {
  return (
    <AppProviders> 
      <CssBaseline />
      <AppContent />
      <NotificationManager /> 
    </AppProviders>
  );
}


export default App;