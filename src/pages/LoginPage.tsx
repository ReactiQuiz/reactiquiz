// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Grid, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { addNotification } = useNotifications();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [infoMessage, setInfoMessage] = useState<string>(location.state?.message || '');

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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
    <Grid container component="main" sx={{ height: '100vh' }}>
      <AuthBrandingPanel variant="login" />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
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
