// src/components/core/AdminRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box } from '@mui/material';

// Prefer server-provided isAdmin flag; fallback to specific admin id if provided
const ADMIN_USER_ID = process.env.REACT_APP_ADMIN_USER_ID;

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { currentUser, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <Box>Loading...</Box>; // Or a spinner
  }

  // Prefer explicit isAdmin flag from the profile; fallback to ID check if configured
  const isAdmin = Boolean(currentUser?.isAdmin) || (ADMIN_USER_ID ? currentUser?.id === ADMIN_USER_ID : false);

  if (!isAdmin) {
    // If not an admin, redirect them to the main dashboard or a "not found" page.
    return <Navigate to="/dashboard" replace />;
  }

  // If they are an admin, render the requested admin page.
  return <>{children}</>;
};

export default AdminRoute;