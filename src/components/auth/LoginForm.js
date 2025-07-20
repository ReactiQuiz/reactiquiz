// src/components/auth/LoginForm.js
import React from 'react';
import { Box, TextField, Button, CircularProgress, Link as MuiLink, Typography, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';

function LoginForm({
  formError,
  isSubmitting,
  identifier,
  setIdentifier,
  password,
  setPassword,
  onLoginSubmit,
  accentColor,
}) {
  return (
    <Box>
      <Box component="form" onSubmit={onLoginSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal" required fullWidth label="Email" // Changed to Email for Supabase
          name="identifier" autoComplete="email" autoFocus
          value={identifier} onChange={(e) => setIdentifier(e.target.value)}
        />
        <TextField
          margin="normal" required fullWidth name="password" label="Password"
          type="password" autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        {/* We can add a "Forgot Password" link here later if needed */}
        {formError && <Alert severity="error" sx={{ my: 2 }}>{formError}</Alert>}
        <Button
          type="submit" fullWidth variant="contained" disabled={isSubmitting}
          sx={{ py: 1.5, mt: 2, backgroundColor: accentColor, '&:hover': { backgroundColor: (theme) => theme.palette.augmentColor({ color: { main: accentColor } }).dark } }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
        >
          {isSubmitting ? 'Signing In...' : 'Login'}
        </Button>
      </Box>
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        Don't have an account?{' '}
        <MuiLink component={RouterLink} to="/register" variant="body2" sx={{ fontWeight: 'bold' }}>
          Sign Up
        </MuiLink>
      </Typography>
    </Box>
  );
}

export default LoginForm;