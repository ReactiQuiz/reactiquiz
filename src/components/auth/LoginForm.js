// src/components/auth/LoginForm.js
import React from 'react';
import { Box, TextField, Button, CircularProgress, Link as MuiLink, Typography, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';

function LoginForm({
  formError,
  isSubmitting,
  identifier, // This is now the username
  setIdentifier,
  password,
  setPassword,
  onLoginSubmit,
  accentColor,
}) {
  return (
    <Box width="100%">
      <Box component="form" onSubmit={onLoginSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal" required fullWidth label="Username" // <-- Correct label
          name="username" autoComplete="username" autoFocus
          value={identifier} onChange={(e) => setIdentifier(e.target.value)}
        />
        <TextField
          margin="normal" required fullWidth name="password" label="Password"
          type="password" autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        {formError && <Alert severity="error" sx={{ my: 2 }}>{formError}</Alert>}
        <Button
          type="submit" fullWidth variant="contained" disabled={isSubmitting}
          sx={{ py: 1.5, mt: 3, mb: 2, backgroundColor: accentColor }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
        >
          {isSubmitting ? 'Signing In...' : 'Login'}
        </Button>
      </Box>
      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        Don't have an account?{' '}
        <MuiLink component={RouterLink} to="/register" variant="body2" sx={{ fontWeight: 'bold' }}>
          Sign Up
        </MuiLink>
      </Typography>
    </Box>
  );
}

export default LoginForm;