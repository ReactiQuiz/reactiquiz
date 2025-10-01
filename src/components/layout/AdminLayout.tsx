// src/components/layout/AdminLayout.tsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../admin/AdminSidebar';

const drawerWidth = 240; // Define the expanded width of the sidebar

const AdminLayout: React.FC = () => {
  // State to control whether the sidebar is open or closed
  const [open, setOpen] = useState(true);

  // Function to toggle the state, passed to the sidebar
  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* The Sidebar component */}
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
        className="animate-[fadeIn_0.4s_ease-out]"
      >
        <Outlet /> {/* Renders the active admin page (e.g., General, Content, Users) */}
      </Box>
    </Box>
  );
};

export default AdminLayout;