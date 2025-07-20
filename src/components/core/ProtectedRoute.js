// src/components/core/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

function ProtectedRoute({ children }) {
  const { currentUser, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    // Show a global loading spinner while checking for a session
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    // If auth is loaded and there's no user, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If auth is loaded and a user exists, render the requested page
  return children;
}

export default ProtectedRoute;