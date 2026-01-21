// src/pages/LoginPage.tsx
/**
 * Login Page
 * 
 * This page handles user authentication. It displays a login form
 * with username and password fields, and manages the login flow
 * including success/error notifications and navigation.
 */
import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';
import LoginForm from '../components/auth/LoginForm';

/**
 * Login Page Component
 * 
 * Displays the login interface with:
 * - Authentication branding panel (animated background)
 * - Login form with username and password
 * - State message display (from location state)
 * - Loading state during submission
 * - Success/error notifications
 * - Redirect to dashboard on successful login
 * 
 * This page is accessible to guest users only. Authenticated users
 * are redirected away from this page.
 * 
 * @returns {JSX.Element} Login page with authentication form
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { addNotification } = useNotifications();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [infoMessage, setInfoMessage] = useState<string>(location.state?.message || '');

  /**
   * Clear State Message Effect
   * 
   * Clears any state message from location state after displaying it.
   * Prevents message from persisting in browser history.
   */
  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  /**
   * Handle Login
   * 
   * Handles user login submission:
   * 1. Sets loading state
   * 2. Clears any previous messages
   * 3. Calls authentication signIn
   * 4. Shows success notification
   * 5. Navigates to dashboard on success
   * 6. Shows error notification on failure
   * 
   * @param {string} username - User's username
   * @param {string} password - User's password
   */
  const handleLogin = async (username: string, password: string): Promise<void> => {
    setIsSubmitting(true);
    setInfoMessage('');
    try {
      await signIn(username, password);
      addNotification('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      addNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Grid container component="main" sx={{ minHeight: '100vh' }}>
      <AuthBrandingPanel variant="login" />
      <Grid item xs={12} sm={12} md={5} sx={{ position: 'relative' }}>
        <LoginForm 
          onSubmit={handleLogin}
          isSubmitting={isSubmitting}
          infoMessage={infoMessage}
        />
      </Grid>
    </Grid>
  );
};

export default LoginPage;
