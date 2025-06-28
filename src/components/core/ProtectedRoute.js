// src/components/core/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function ProtectedRoute({ children, message = "Please login to access this page." }) {
  const { currentUser, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return null; // AppRoutes handles global loading indicator
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location, message: message }} replace />; // <-- CHANGED TO /login
  }

  return children;
}

export default ProtectedRoute;