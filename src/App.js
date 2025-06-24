// src/App.js
import { useState } from 'react'; // Removed useEffect here, moved to AuthProvider
import { BrowserRouter as Router, useLocation } from 'react-router-dom'; // Removed useNavigate, auth logic moves
import { ThemeProvider, CssBaseline, Box, Toolbar, CircularProgress } from '@mui/material';
import { darkTheme } from './theme';
import AppDrawer from './components/core/AppDrawer';
import Footer from './components/core/Footer';
import NavBar from './components/core/Navbar'; // NavBar will use useAuth
import AppRoutes from './components/AppRoutes'; // AppRoutes will pass down fewer props
// Removed apiClient import, AuthProvider handles token in headers
import ChangePasswordModal from './components/auth/ChangePasswordModal';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // <-- IMPORT AuthProvider and useAuth

// AppContent will consume the auth context
function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { currentUser, isLoadingAuth } = useAuth(); // <-- Get currentUser from context

  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [authError, setAuthError] = useState(''); // For login/register form errors, local to AccountPage via AppRoutes

  const isHomePage = location.pathname === '/';

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleOpenChangePasswordModal = () => setChangePasswordModalOpen(true);
  const handleCloseChangePasswordModal = () => setChangePasswordModalOpen(false);

  // If still loading initial auth state, you might want to show a global loader
  if (isLoadingAuth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress /> {/* Or your custom loading component */}
      </Box>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar
          onIconButtonClick={!isHomePage ? handleDrawerToggle : undefined}
          // currentUser passed from useAuth() to NavBar automatically
          onOpenChangePasswordModal={handleOpenChangePasswordModal}
          showMenuIcon={!isHomePage}
          forceLoginButton={isHomePage && !currentUser} // Show login if on home and not logged in
        />
        <Toolbar /> {/* Spacer for fixed AppBar */}

        {!isHomePage && <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />}

        <AppRoutes
          // No need to pass currentUser, handleLogout, setCurrentUser from here
          authError={authError} // For login/register forms in AccountPage
          setAuthError={setAuthError} // For login/register forms
          onOpenChangePasswordModal={handleOpenChangePasswordModal} // For AccountPage logged-in view
        />
        <Footer />
      </Box>
      {/* ChangePasswordModal still needs currentUser if it doesn't use useAuth directly */}
      {currentUser && (
        <ChangePasswordModal
          open={changePasswordModalOpen}
          onClose={handleCloseChangePasswordModal}
        // currentUser={currentUser} // Can be removed if ChangePasswordModal uses useAuth
        />
      )}
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider> {/* <--- WRAP AppContent with AuthProvider */}
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;