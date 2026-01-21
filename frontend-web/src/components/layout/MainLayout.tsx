// src/components/layout/MainLayout.tsx
/**
 * Main Layout Component
 * 
 * This component provides the main layout structure for authenticated users.
 * It includes the navigation bar, drawer, footer, and manages the change
 * password modal state. It passes context to child routes via Outlet.
 */
import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import NavBar from '../core/Navbar';
import Footer from '../core/Footer';
import AppDrawer from '../core/AppDrawer';
import { Outlet } from 'react-router-dom';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Main Layout Component
 * 
 * Main application layout for authenticated users. Provides:
 * - Fixed navigation bar at the top
 * - Side drawer for navigation
 * - Main content area with routing outlet
 * - Footer at the bottom
 * - Change password modal (conditionally rendered)
 * 
 * The layout manages drawer state and change password modal state,
 * and passes handlers to child components and routes via context.
 * 
 * @returns {JSX.Element} Main layout with navbar, drawer, content, and footer
 */
const MainLayout: React.FC = () => {
  // State for drawer open/close
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 1. Centralize the state for the Change Password modal here.
  // This ensures the modal is managed at the layout level
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  // Get current user for conditional rendering
  const { currentUser } = useAuth();

  /**
   * Handle Drawer Toggle
   * 
   * Toggles the drawer open/close state when menu icon is clicked.
   */
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  
  // 2. Create handler functions that this component owns.
  /**
   * Handle Open Password Modal
   * 
   * Opens the change password modal.
   */
  const handleOpenPasswordModal = () => setChangePasswordModalOpen(true);
  
  /**
   * Handle Close Password Modal
   * 
   * Closes the change password modal.
   */
  const handleClosePasswordModal = () => setChangePasswordModalOpen(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Bar
          Passes drawer toggle handler and change password modal handler */}
      <NavBar
        onIconButtonClick={handleDrawerToggle}
        // 3. Pass the *correct handler function* down to the NavBar.
        onOpenChangePasswordModal={handleOpenPasswordModal}
      />
      
      {/* Side Drawer
          Opens/closes when menu icon is clicked */}
      <AppDrawer open={drawerOpen} onClose={handleDrawerToggle} />
      
      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar spacer to account for fixed AppBar */}
        <Toolbar />
        
        {/* 4. Pass the handler function down to child routes via the Outlet's context.
            This allows child routes (like AccountPage) to trigger the change password modal */}
        <Outlet context={{ onOpenChangePasswordModal: handleOpenPasswordModal }} />
      </Box>
      
      {/* Footer */}
      <Footer />
      
      {/* 5. The modal instance is now controlled by this layout's state.
          Only render if user is authenticated */}
      {currentUser && (
        <ChangePasswordModal
          open={changePasswordModalOpen}
          onClose={handleClosePasswordModal}
        />
      )}
    </Box>
  );
};

export default MainLayout;