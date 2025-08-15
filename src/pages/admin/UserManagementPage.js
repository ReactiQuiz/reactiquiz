// src/pages/admin/UserManagementPage.js
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

function UserManagementPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        User Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          User management features, such as viewing, editing, and deleting users, will be available here in a future update. This section will provide a table of all registered users with search and filtering capabilities.
        </Typography>
      </Paper>
    </Box>
  );
}

export default UserManagementPage;