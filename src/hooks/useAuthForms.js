// src/hooks/useAuthForms.js
import { useState, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { getOrSetDeviceID } from '../utils/deviceId';

/**
 * A custom hook to manage the state and logic for all authentication forms
 * (Login, Register, Forgot Password).
 */
export const useAuthForms = () => {
  const { login } = useAuth();

  // --- Shared State ---
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Login State ---
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [showLoginOtpInput, setShowLoginOtpInput] = useState(false);

  // --- Register State ---
  const [registerIdentifier, setRegisterIdentifier] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');
  const [registerClass, setRegisterClass] = useState('');

  // --- Forgot Password State ---
  const [forgotPasswordIdentifier, setForgotPasswordIdentifier] = useState('');
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');
  const [forgotPasswordNewPassword, setForgotPasswordNewPassword] = useState('');
  const [forgotPasswordConfirmNewPassword, setForgotPasswordConfirmNewPassword] = useState('');

  // --- Utility Functions ---
  const clearFormStates = useCallback(() => {
    setFormError('');
    setSuccessMessage('');
  }, []);

  // --- Login Logic ---
  const handleLoginSubmit = async () => {
    clearFormStates();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setFormError('Username and password are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/api/users/login', { identifier: loginIdentifier.trim(), password: loginPassword });
      setSuccessMessage(response.data.message || "OTP has been sent.");
      setShowLoginOtpInput(true);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Login failed.');
      setShowLoginOtpInput(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginOtpSubmit = async () => {
    clearFormStates();
    if (!loginOtp.trim() || loginOtp.length !== 6 || !/^\d+$/.test(loginOtp)) {
      setFormError('Please enter a valid 6-digit OTP.');
      return;
    }
    setIsSubmitting(true);
    try {
      const deviceId = getOrSetDeviceID();
      const response = await apiClient.post('/api/users/verify-otp', { identifier: loginIdentifier.trim(), otp: loginOtp.trim(), deviceIdFromClient: deviceId });
      if (response.data?.user && response.data?.token) {
        login(response.data.user, response.data.token); // This will trigger redirect via AuthContext
      } else {
        setFormError(response.data.message || "OTP verification failed.");
      }
    } catch (error) {
      setFormError(error.response?.data?.message || 'Error verifying OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Registration Logic ---
  const handleRegisterSubmit = async (onSuccess) => {
    clearFormStates();
    if (!registerIdentifier.trim() || !registerEmail.trim() || !registerPassword.trim() || !registerAddress.trim() || !registerClass.trim()) { setFormError('All fields are required.'); return; }
    if (registerPassword !== registerConfirmPassword) { setFormError('Passwords do not match.'); return; }
    if (registerPassword.length < 6) { setFormError('Password must be at least 6 characters long.'); return; }
    if (!/\S+@\S+\.\S+/.test(registerEmail)) { setFormError('Invalid email format.'); return; }
    const classNum = parseInt(registerClass);
    if (isNaN(classNum) || classNum <= 0 || classNum > 12) { setFormError('Class must be a valid number (e.g., 6-12).'); return; }
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/api/users/register', { identifier: registerIdentifier.trim(), email: registerEmail.trim().toLowerCase(), password: registerPassword, address: registerAddress.trim(), class: String(classNum) });
      setSuccessMessage(response.data.message || "Registration successful!");
      if (onSuccess) onSuccess(registerIdentifier.trim()); // Callback to e.g., switch tab
    } catch (error) {
      setFormError(error.response?.data?.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- Forgot Password Logic ---
  const handleRequestResetOtp = async () => {
    clearFormStates();
    if (!forgotPasswordIdentifier.trim()) { setFormError('Please enter your username.'); return; }
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/api/users/request-password-reset', { identifier: forgotPasswordIdentifier.trim() });
      setSuccessMessage(response.data.message || "If an account exists, an OTP has been sent.");
      return true; // Indicate success to the component
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to request OTP.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordWithOtp = async (onSuccess) => {
    clearFormStates();
    if (!forgotPasswordOtp.trim() || forgotPasswordOtp.length !== 6) { setFormError('Please enter a valid 6-digit OTP.'); return; }
    if (!forgotPasswordNewPassword || forgotPasswordNewPassword.length < 6) { setFormError('New password must be at least 6 characters.'); return; }
    if (forgotPasswordNewPassword !== forgotPasswordConfirmNewPassword) { setFormError('New passwords do not match.'); return; }
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/api/users/reset-password-with-otp', { identifier: forgotPasswordIdentifier.trim(), otp: forgotPasswordOtp.trim(), newPassword: forgotPasswordNewPassword });
      setSuccessMessage(response.data.message || "Password reset successfully.");
      if (onSuccess) onSuccess(forgotPasswordIdentifier.trim()); // Callback to switch tab
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return {
    formError,
    successMessage,
    isSubmitting,
    loginIdentifier, setLoginIdentifier,
    loginPassword, setLoginPassword,
    loginOtp, setLoginOtp,
    showLoginOtpInput, setShowLoginOtpInput,
    registerIdentifier, setRegisterIdentifier,
    registerEmail, setRegisterEmail,
    registerPassword, setRegisterPassword,
    registerConfirmPassword, setRegisterConfirmPassword,
    registerAddress, setRegisterAddress,
    registerClass, setRegisterClass,
    forgotPasswordIdentifier, setForgotPasswordIdentifier,
    forgotPasswordOtp, setForgotPasswordOtp,
    forgotPasswordNewPassword, setForgotPasswordNewPassword,
    forgotPasswordConfirmNewPassword, setForgotPasswordConfirmNewPassword,
    handleLoginSubmit,
    handleLoginOtpSubmit,
    handleRegisterSubmit,
    handleRequestResetOtp,
    handleResetPasswordWithOtp,
    clearFormStates,
  };
};