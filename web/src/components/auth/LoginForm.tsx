// src/components/auth/LoginForm.tsx
/**
 * Login Form
 *
 * The sign-in panel matched from Login.dc.html — a plain cream card, no
 * glass or shader background. Replaces the previous dark glassmorphism
 * version, which hardcoded white-on-transparent text.
 */
import React, { useState, FormEvent } from 'react';
import { Box, Typography, Alert, TextField, Link as MuiLink, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import { motion } from 'framer-motion';
import { LoginFormProps } from '../../types';
import LiquidGlassButton from '../animations/LiquidGlassButton';

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isSubmitting, infoMessage }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit(username, password);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 3, py: 6 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'primary.main', mb: 2.5 }}>
          <LoginIcon sx={{ color: 'background.default', fontSize: 24 }} />
        </Box>

        <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', sm: '2.2rem' } }}>Sign in</Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 3.25, color: 'text.secondary' }}>
          Welcome back! Please sign in to continue.
        </Typography>

        {infoMessage && (
          <Alert severity="success" sx={{ mb: 2.25, borderRadius: 3 }}>
            {infoMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal" required fullWidth label="Username" autoComplete="username" autoFocus
            value={username} onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 1 }}
          />
          <TextField
            margin="normal" required fullWidth label="Password" type="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <LiquidGlassButton
            type="submit"
            variant="primary"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{ width: '100%' }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </LiquidGlassButton>

          <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
            Don't have an account?{' '}
            <MuiLink component={RouterLink} to="/register" sx={{ color: 'primary.dark', fontWeight: 600 }}>
              Create one
            </MuiLink>
          </Typography>
          <Typography align="center" sx={{ mt: 2.5 }}>
            <MuiLink component={RouterLink} to="/" sx={{ fontSize: 13.5, color: 'text.secondary' }}>
              ← Back to home
            </MuiLink>
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default LoginForm;
