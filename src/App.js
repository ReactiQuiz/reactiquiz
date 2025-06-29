// src/App.js
import { useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Toolbar, CircularProgress } from '@mui/material';
import { darkTheme } from './theme';
import AppDrawer from './components/core/AppDrawer';
import Footer from './components/core/Footer';
import NavBar from './components/core/Navbar';
import AppRoutes from './components/AppRoutes';
import ChangePasswordModal from './components/auth/ChangePasswordModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { currentUser, isLoadingAuth } = useAuth();

  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Updated to check for the new base path
  const isHomePage = location.pathname === '/' || location.pathname === '/reactiquiz/';

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleOpenChangePasswordModal = () => setChangePasswordModalOpen(true);
  const handleCloseChangePasswordModal = () => setChangePasswordModalOpen(false);

  if (isLoadingAuth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar
          onIconButtonClick={handleDrawerToggle}
          onOpenChangePasswordModal={handleOpenChangePasswordModal}
          showMenuIcon={!isHomePage}
          forceLoginButton={isHomePage && !currentUser}
        />
        <Toolbar />
        {!isHomePage && <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />}
        <AppRoutes onOpenChangePasswordModal={handleOpenChangePasswordModal} />
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
    // Set the basename for the entire application
    <Router basename="/reactiquiz">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;