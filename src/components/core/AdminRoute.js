// src/components/core/AdminRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

function AdminRoute({ children }) {
  const { currentUser, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // The crucial check: is the user an admin?
  if (currentUser && !currentUser.isAdmin) {
    return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5">Access Denied</Typography>
            <Typography color="text.secondary">You do not have permission to view this page.</Typography>
        </Box>
    );
  }

  return children;
}

export default AdminRoute;