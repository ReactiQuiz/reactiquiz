// src/pages/RegisterPage.tsx
/**
 * Register Page
 * 
 * This page handles user registration. It displays a registration form
 * with fields for username, email, password, confirm password, address,
 * phone, and class. Manages the registration flow with validation.
 */
import React, { useState } from 'react';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthBrandingPanel from '../components/auth/AuthBrandingPanel';
import RegisterForm from '../components/auth/RegisterForm';
import { RegisterRequest } from '../types';

/**
 * Register Page Component
 * 
 * Displays the registration interface with:
 * - Registration form with all required fields
 * - Password confirmation validation
 * - Loading state during submission
 * - Error message display
 * - Success redirect to login page
 * - Authentication branding panel (animated background)
 * 
 * This page is accessible to guest users only. Authenticated users
 * are redirected away from this page.
 * 
 * @returns {JSX.Element} Register page with registration form
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Handle Register
   * 
   * Handles user registration submission:
   * 1. Validates password confirmation match
   * 2. Sets loading state
   * 3. Clears any previous errors
   * 4. Calls authentication signUp
   * 5. Redirects to login page with success message
   * 6. Shows error message on failure
   * 
   * @param {RegisterRequest & { confirmPassword: string; userClass: string; class: string }} formData - Registration form data
   */
  const handleRegister = async (formData: RegisterRequest & { confirmPassword: string; userClass: string; class: string }): Promise<void> => {
    // Validate password confirmation match
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
