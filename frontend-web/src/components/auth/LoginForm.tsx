// src/components/auth/LoginForm.tsx
/**
 * Login Form Component
 * 
 * This component renders a login form with animated shader background
 * and glass morphism styling. It includes username and password fields,
 * form validation, and loading states.
 */
import React, { useState, FormEvent } from 'react';
import { Box, Typography, Alert, TextField, Link as MuiLink, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { motion } from 'framer-motion';
import { LoginFormProps } from '../../types';
import LiquidGlassButton from '../animations/LiquidGlassButton';
import ShaderAnimationAuth from '../animations/ShaderAnimationAuth';

/**
 * Login Form Component
 * 
 * Renders a login form with:
 * - Animated shader background
 * - Glass morphism container with backdrop blur
 * - Username and password input fields
 * - Form submission with loading state
 * - Link to registration page
 * - Optional info message display
 * 
 * Features:
 * - Framer Motion animations for smooth entrance
 * - Glass morphism styling for modern UI
 * - Form validation and error handling
 * - Loading state with spinner
 * 
 * @param {LoginFormProps} props - Component props
 * @returns {JSX.Element} Login form with animated background
 */
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isSubmitting, infoMessage }) => {
  // State for username input
  const [username, setUsername] = useState<string>('');
  // State for password input
  const [password, setPassword] = useState<string>('');

  /**
   * Handle Submit
   * 
   * Handles form submission. Prevents default form behavior
   * and calls the onSubmit callback with username and password.
   * 
   * @param {FormEvent<HTMLFormElement>} event - Form submission event
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    // Call onSubmit callback with username and password
    onSubmit(username, password);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Shader Background */}
      <ShaderAnimationAuth />
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg px-8 relative z-10"
        style={{ maxWidth: '500px' }}
      >
        {/* Glass morphism container */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl" style={{ padding: '3rem' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <LoginIcon sx={{ fontSize: 32, color: 'white' }} />
              </div>
            </div>
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2rem' }
              }}
            >
              Sign In
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.95rem'
              }}
            >
              Welcome back! Please sign in to continue
            </Typography>
          </motion.div>
          
          {infoMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3, 
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  '& .MuiAlert-icon': { color: '#4ade80' }
                }}
              >
                {infoMessage}
              </Alert>
            </motion.div>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <TextField 
                margin="normal" 
                required 
                fullWidth 
                label="Username" 
                autoComplete="username" 
                autoFocus 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />,
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    height: '56px',
                    fontSize: '1.1rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' },
                  '& .MuiOutlinedInput-input': { color: 'white', fontSize: '1.1rem' },
                }}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <TextField 
                margin="normal" 
                required 
                fullWidth 
                label="Password" 
                type="password" 
                autoComplete="current-password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />,
                }}
                sx={{
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    height: '56px',
                    fontSize: '1.1rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' },
                  '& .MuiOutlinedInput-input': { color: 'white', fontSize: '1.1rem' },
                }}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <LiquidGlassButton
                type="submit" 
                variant="accent"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{
                  width: '100%',
                  py: 2.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mb: 4,
                  height: '56px',
                }}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </LiquidGlassButton>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-center"
            >
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Don't have an account?{' '}
                <MuiLink 
                  component={RouterLink} 
                  to="/register" 
                  sx={{ 
                    color: '#60a5fa',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { 
                      textDecoration: 'underline',
                      color: '#3b82f6'
                    }
                  }}
                >
                  Sign Up
                </MuiLink>
              </Typography>
            </motion.div>
          </Box>
        </div>
      </motion.div>
    </Box>
  );
};

export default LoginForm;
