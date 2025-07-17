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

  // Check for auth pages to implement a different layout
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  // Homepage check for other layout decisions
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

  // If it's an auth page, render only the routes within a full-height box
  if (isAuthPage) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
          <AppRoutes onOpenChangePasswordModal={handleOpenChangePasswordModal} />
        </Box>
      </ThemeProvider>
    );
  }

  // Default layout for all other pages
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
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {!isHomePage && <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />}
          <AppRoutes onOpenChangePasswordModal={handleOpenChangePasswordModal} />
        </Box>
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
    <Router basename="/reactiquiz">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;