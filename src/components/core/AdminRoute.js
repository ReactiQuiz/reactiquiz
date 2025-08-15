// src/components/core/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography } from '@mui/material';

// This is a simplified check. In a real app, you'd have a robust role system.
const ADMIN_USER_ID = process.env.REACT_APP_ADMIN_USER_ID;

function AdminRoute({ children }) {
  const { currentUser, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <Box>Loading...</Box>; // Or a spinner
  }

  // Check if the logged-in user's ID matches the one from environment variables
  const isAdmin = currentUser && currentUser.id === ADMIN_USER_ID;

  if (!isAdmin) {
    // If not an admin, redirect them to the main dashboard or a "not found" page.
    return <Navigate to="/dashboard" replace />;
  }

  // If they are an admin, render the requested admin page.
  return children;
}

export default AdminRoute;