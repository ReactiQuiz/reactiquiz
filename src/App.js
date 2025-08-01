// src/App.js
import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, Box, Toolbar } from '@mui/material';
import { AppThemeProvider } from './contexts/ThemeContext';
import { SubjectColorsProvider } from './contexts/SubjectColorsContext';
import { TopicsProvider } from './contexts/TopicsContext'; 
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
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
    <BrowserRouter>
      <AuthProvider>
        <AppThemeProvider>
          <SubjectColorsProvider>
            <TopicsProvider> 
              <AppLayout />
            </TopicsProvider>
          </SubjectColorsProvider>
        </AppThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;