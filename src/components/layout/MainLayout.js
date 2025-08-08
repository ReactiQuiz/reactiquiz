// src/components/layout/MainLayout.js
import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import NavBar from '../core/Navbar';
import Footer from '../core/Footer';
import AppDrawer from '../core/AppDrawer';
import { Outlet } from 'react-router-dom';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import { useAuth } from '../../contexts/AuthContext';

function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const { currentUser } = useAuth();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleOpenChangePasswordModal = () => setChangePasswordModalOpen(true);
  const handleCloseChangePasswordModal = () => setChangePasswordModalOpen(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar
        onIconButtonClick={handleDrawerToggle}
        onOpenChangePasswordModal={handleOpenChangePasswordModal}
      />
      <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        <Outlet context={{ onOpenChangePasswordModal }} /> {/* Pass down context to child routes */}
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
export default MainLayout;