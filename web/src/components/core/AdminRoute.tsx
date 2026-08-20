// src/components/core/AdminRoute.tsx
/**
 * Admin Route Component
 * 
 * This component protects routes that require admin privileges.
 * It checks if the current user is an admin and either renders the
 * admin content or redirects to the dashboard.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box } from '@mui/material';

/**
 * Admin User ID Configuration
 * 
 * Optional environment variable that specifies a specific user ID
 * that should be treated as admin. This is a fallback if the server
 * doesn't provide an isAdmin flag. Prefer using the server-provided
 * isAdmin flag when available.
 */
const ADMIN_USER_ID = process.env.REACT_APP_ADMIN_USER_ID;

/**
 * AdminRouteProps Interface
 * 
 * Props for the AdminRoute component.
 */
interface AdminRouteProps {
  children: React.ReactNode; // The admin-only content to render
}

/**
 * Admin Route Component
 * 
 * Wraps routes that require admin privileges. This component:
 * 1. Checks if authentication is loading - shows loading message
 * 2. Checks if user is an admin - redirects to dashboard if not
 * 3. Renders admin content if user is an admin
 * 
 * Admin check logic:
 * - First checks the server-provided `isAdmin` flag from user profile
 * - Falls back to checking if user ID matches ADMIN_USER_ID (if configured)
 * 
 * @param {AdminRouteProps} props - Component props
 * @returns {JSX.Element} Admin content or redirect to dashboard
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // Get authentication state from context
  const { currentUser, isLoadingAuth } = useAuth();

  // Show loading message while checking authentication
  if (isLoadingAuth) {
    return <Box>Loading...</Box>; // Or a spinner
  }

  /**
   * Admin Check
   * 
   * Determines if the current user has admin privileges.
   * Priority:
   * 1. Server-provided isAdmin flag (preferred)
   * 2. Environment variable ADMIN_USER_ID match (fallback)
   */
  // Prefer explicit isAdmin flag from the profile; fallback to ID check if configured
  const isAdmin = Boolean(currentUser?.isAdmin) || (ADMIN_USER_ID ? currentUser?.id === ADMIN_USER_ID : false);

  // Redirect to dashboard if user is not an admin
  if (!isAdmin) {
    // If not an admin, redirect them to the main dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If they are an admin, render the requested admin page
  return <>{children}</>;
};

export default AdminRoute;