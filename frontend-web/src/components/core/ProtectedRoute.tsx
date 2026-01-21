// src/components/core/ProtectedRoute.tsx
/**
 * Protected Route Component
 * 
 * This component protects routes that require authentication.
 * It checks if a user is logged in and either renders the protected
 * content or redirects to the login page. Also passes context from
 * the parent layout to child components.
 */
import React from 'react';
import { Navigate, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * ProtectedRouteProps Interface
 * 
 * Props for the ProtectedRoute component.
 */
interface ProtectedRouteProps {
  children: React.ReactElement; // The protected component to render
}

/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication. This component:
 * 1. Checks if authentication is loading - shows loading spinner
 * 2. Checks if user is authenticated - redirects to login if not
 * 3. Renders protected content if authenticated
 * 4. Passes context from parent layout to children
 * 
 * The component preserves the intended destination in the navigation
 * state so users can be redirected back after logging in.
 * 
 * @param {ProtectedRouteProps} props - Component props
 * @returns {JSX.Element} Protected content or redirect to login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Get authentication state from context
  const { currentUser, isLoadingAuth } = useAuth();
  // Get current location for redirect preservation
  const location = useLocation();
  // Get the context from the parent layout (e.g., MainLayout)
  // This allows passing functions like onOpenChangePasswordModal to child pages
  const context = useOutletContext();

  // Show loading spinner while checking authentication status
  if (isLoadingAuth) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' // 80% of viewport height
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if user is not authenticated
  // Preserve the intended destination in state for redirect after login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content and pass context from parent layout
  // React.cloneElement allows us to inject props (context) into the child component
  return React.cloneElement(children, { context });
};

export default ProtectedRoute;