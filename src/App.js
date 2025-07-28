// src/App.js
import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom'; // Use BrowserRouter
import { ThemeProvider, CssBaseline, Box, Toolbar } from '@mui/material';
import { darkTheme } from './theme';
import AppDrawer from './components/core/AppDrawer';
import Footer from './components/core/Footer';
import NavBar from './components/core/Navbar';
import AppRoutes from './components/AppRoutes';
import ChangePasswordModal from './components/auth/ChangePasswordModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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
          <Toolbar /> 
          <AppRoutes onOpenChangePasswordModal={handleOpenChangePasswordModal} />
        </Box>
        <Footer />
      </Box>
      {currentUser && (
        <ChangePasswordModal
          open={changePasswordModalOpen}
          onClose={handleCloseChangePasswordModal}
        />
      )}
    </ThemeProvider>
  );
}

function App() {
  return (
    // Use BrowserRouter directly
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;