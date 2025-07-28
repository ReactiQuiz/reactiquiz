// src/App.js
import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Toolbar } from '@mui/material';
import { darkTheme } from './theme';
import AppDrawer from './components/core/AppDrawer';
import Footer from './components/core/Footer';
import NavBar from './components/core/Navbar';
import AppRoutes from './components/AppRoutes'; // Corrected import path
import ChangePasswordModal from './components/auth/ChangePasswordModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// This is the main layout component. It's now much simpler.
function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const { currentUser } = useAuth();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleOpenChangePasswordModal = () => setChangePasswordModalOpen(true);
  const handleCloseChangePasswordModal = () => setChangePasswordModalOpen(false);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar
          onIconButtonClick={handleDrawerToggle}
          onOpenChangePasswordModal={handleOpenChangePasswordModal}
        />
        <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* A Toolbar spacer is often needed to push content below the fixed AppBar */}
          <Toolbar /> 
          {/* AppRoutes will now handle all the complex rendering logic */}
          <AppRoutes onOpenChangePasswordModal={handleOpenChangePasswordModal} />
        </Box>
        <Footer />
      </Box>
      {/* The password modal is tied to the layout as it can be opened from the navbar */}
      {currentUser && (
        <ChangePasswordModal
          open={changePasswordModalOpen}
          onClose={handleCloseChangePasswordModal}
        />
      )}
    </ThemeProvider>
  );
}

// The main App function now just sets up the providers and the main layout.
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;