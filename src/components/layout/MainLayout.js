// src/components/layout/MainLayout.js
import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import NavBar from '../core/Navbar';
import Footer from '../core/Footer';
import AppDrawer from '../core/AppDrawer';
import { Outlet } from 'react-router-dom';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import { useAuth } from '../../contexts/AuthContext';

function MainLayout({ onOpenChangePasswordModal }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const { currentUser } = useAuth();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  
  // The modal is now controlled by the App/Navbar level, but we still need a local handler
  // if we want to open it from within the layout itself in the future.
  const handleOpenLocalPasswordModal = () => setChangePasswordModalOpen(true);
  const handleCloseLocalPasswordModal = () => setChangePasswordModalOpen(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar
        onIconButtonClick={handleDrawerToggle}
        onOpenChangePasswordModal={onOpenChangePasswordModal} // Pass the prop down to the navbar
      />
      <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        {/* Pass the prop down to the child routes via the Outlet's context */}
        <Outlet context={{ onOpenChangePasswordModal }} />
      </Box>
      <Footer />
      {/* It's better to keep the modal instance at the top level (App.js)
          but this structure still works if needed. */}
      {currentUser && (
        <ChangePasswordModal
          open={changePasswordModalOpen}
          onClose={handleCloseLocalPasswordModal}
        />
      )}
    </Box>
  );
}
export default MainLayout;