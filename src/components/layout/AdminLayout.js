// src/components/layout/AdminLayout.js
import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../admin/AdminSidebar'; // We will create this

const drawerWidth = 240;

function AdminLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <AdminSidebar drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Outlet /> {/* Child admin pages will render here */}
      </Box>
    </Box>
  );
}

export default AdminLayout;