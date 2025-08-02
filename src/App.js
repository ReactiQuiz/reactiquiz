// src/App.js
import { useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Toolbar, CircularProgress } from '@mui/material';
import { AppThemeProvider } from './contexts/ThemeContext';
import { SubjectColorsProvider } from './contexts/SubjectColorsContext';
import { TopicsProvider } from './contexts/TopicsContext';
import AppDrawer from './components/core/AppDrawer';
import Footer from './components/core/Footer';
import NavBar from './components/core/Navbar';
import AppRoutes from './components/AppRoutes';
import ChangePasswordModal from './components/auth/ChangePasswordModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// This component contains the logic to switch between layouts
function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleOpenChangePasswordModal = () => setChangePasswordModalOpen(true);
  const handleCloseChangePasswordModal = () => setChangePasswordModalOpen(false);

  // --- START OF LAYOUT SWITCHING LOGIC ---
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // If it's an auth page, render a minimal layout containing only the routes.
  if (isAuthPage) {
    return <AppRoutes onOpenChangePasswordModal={handleOpenChangePasswordModal} />;
  }
  // --- END OF LAYOUT SWITCHING LOGIC ---

  // For all other pages, render the full application layout with Navbar, Drawer, etc.
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
    <BrowserRouter>
      <AuthProvider>
        <AppThemeProvider>
          <SubjectColorsProvider>
            <TopicsProvider>
              <CssBaseline />
              <AppContent />
            </TopicsProvider>
          </SubjectColorsProvider>
        </AppThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;