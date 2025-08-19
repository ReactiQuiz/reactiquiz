// src/components/layout/AdminLayout.js
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../admin/AdminSidebar';

const drawerWidth = 240;

function AdminLayout() {
  // --- START OF CHANGES: Add state to manage sidebar open/closed status ---
  const [open, setOpen] = useState(true);

  const handleToggleDrawer = () => {
    setOpen(!open);
  };
  // --- END OF CHANGES ---

  return (
    // The main Box remains a flex container
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* --- START OF CHANGES: Pass state and handler to the sidebar --- */}
      <AdminSidebar 
        drawerWidth={drawerWidth} 
        open={open} 
        toggleDrawer={handleToggleDrawer} 
      />
      {/* --- END OF CHANGES --- */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          // The width calculation is no longer needed here.
          // The flex-grow property will automatically fill the available space.
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminLayout;