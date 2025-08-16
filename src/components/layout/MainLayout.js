// src/components/layout/MainLayout.js
import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import NavBar from '../core/Navbar';
import Footer from '../core/Footer';
import AppDrawer from '../core/AppDrawer';
import { Outlet } from 'react-router-dom';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import { useAuth } from '../../contexts/AuthContext';

// --- START OF THE DEFINITIVE FIX ---

function MainLayout() { // Removed the onOpenChangePasswordModal prop from here
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 1. Centralize the state for the Change Password modal here.
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const { currentUser } = useAuth();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  
  // 2. Create handler functions that this component owns.
  const handleOpenPasswordModal = () => setChangePasswordModalOpen(true);
  const handleClosePasswordModal = () => setChangePasswordModalOpen(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar
        onIconButtonClick={handleDrawerToggle}
        // 3. Pass the *correct handler function* down to the NavBar.
        onOpenChangePasswordModal={handleOpenPasswordModal}
      />
      <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        {/* 4. Pass the handler function down to child routes via the Outlet's context. */}
        <Outlet context={{ onOpenChangePasswordModal: handleOpenPasswordModal }} />
      </Box>
      <Footer />
      {/* 5. The modal instance is now controlled by this layout's state. */}
      {currentUser && (
        <ChangePasswordModal
          open={changePasswordModalOpen}
          onClose={handleClosePasswordModal}
        />
      )}
    </Box>
  );
}
// --- END OF THE DEFINITIVE FIX ---

export default MainLayout;