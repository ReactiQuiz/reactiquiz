// src/components/admin/AdminLayout.js
import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const drawerWidth = 240;

function AdminLayout() {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        // This calculation ensures the layout takes up the full available height
        // between the header (64px) and footer (49px).
        minHeight: 'calc(100vh - 64px - 49px)' 
      }}
    >
      <AdminSidebar drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {/* This Outlet component is where the child routes like GeneralSettingsPage will be rendered */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminLayout;