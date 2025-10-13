// src/components/core/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation, useOutletContext } from 'react-router-dom'; // <-- Import useOutletContext
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, isLoadingAuth } = useAuth();
  const location = useLocation();
  const context = useOutletContext(); // <-- Get the context from the parent (MainLayout)

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

  return React.cloneElement(children, { context });
};

export default ProtectedRoute;