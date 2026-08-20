// src/components/layout/AdminLayout.tsx
/**
 * Admin Layout Component
 * 
 * This component provides the layout structure for admin pages.
 * It includes an admin-specific sidebar and main content area.
 * Used for all admin panel routes.
 */
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../admin/AdminSidebar';

/**
 * Drawer Width
 * 
 * The expanded width of the admin sidebar in pixels.
 */
const drawerWidth = 240;

/**
 * Admin Layout Component
 * 
 * Layout for admin panel pages. Provides:
 * - Admin sidebar with navigation menu
 * - Main content area with routing outlet
 * - Smooth transitions and animations
 * 
 * The sidebar can be toggled open/closed and contains admin-specific
 * navigation items. Main content area adjusts based on sidebar state.
 * 
 * @returns {JSX.Element} Admin layout with sidebar and content area
 */
const AdminLayout: React.FC = () => {
  // State to control whether the sidebar is open or closed
  // Defaults to open (true) for admin panel
  const [open, setOpen] = useState(true);

  /**
   * Handle Toggle Drawer
   * 
   * Function to toggle the sidebar open/close state.
   * Passed to the AdminSidebar component.
   */
  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* The Sidebar component
          Wrapped in div with transition class for smooth animations */}
      <div className="transition-transform duration-300">
        <AdminSidebar 
          drawerWidth={drawerWidth} 
          open={open} 
          toggleDrawer={handleToggleDrawer} 
        />
      </div>
      
      {/* The Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, // This makes the content area take up all remaining space
          p: 3,        // Standard padding
        }}
        className="animate-[fadeIn_0.4s_ease-out]" // Fade in animation
      >
        {/* Renders the active admin page (e.g., GeneralSettingsPage, ContentManagementPage, UserManagementPage) */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;