// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';
import RegisterForm from '../components/auth/RegisterForm';
import { RegisterRequest } from '../types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleRegister = async (formData: RegisterRequest & { confirmPassword: string; userClass: string; class: string }): Promise<void> => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await signUp({ 
        username: formData.username, 
        email: formData.email, 
        password: formData.password, 
        address: formData.address, 
        phone: formData.phone, 
        class: formData.userClass 
      });
      navigate('/login', { state: { message: "Registration successful! Please sign in." } });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Grid container component="main" sx={{ minHeight: '100vh' }}>
      <Grid item xs={12} sm={12} md={5} sx={{ position: 'relative' }}>
        <RegisterForm 
          onSubmit={handleRegister}
          isSubmitting={isSubmitting}
          error={error}
        />
      </Grid>
      <AuthBrandingPanel variant="register" />
    </Grid>
  );
};

export default RegisterPage;
