// admin/src/app/(admin)/layout.js
'use client'; 

import { Box } from '@mui/material';
import AdminSidebar from '../../components/AdminSidebar';

const drawerWidth = 240;

export default function AdminLayout({ children }) {
  // This layout doesn't need to import globals.css directly.
  // The root layout (admin/src/app/layout.js) handles that.
  // We can safely remove the import if it exists.
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}