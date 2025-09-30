// src/components/auth/LoginForm.tsx
import React, { useState, FormEvent } from 'react';
import { Box, Typography, Alert, TextField, Button, Link as MuiLink, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import { LoginFormProps } from '../../types';

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isSubmitting, infoMessage }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit(username, password);
  };

  return (
    <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Sign In
      </Typography>
      
      {infoMessage && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{infoMessage}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
        <TextField 
          margin="normal" 
          required 
          fullWidth 
          label="Username" 
          autoComplete="username" 
          autoFocus 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <TextField 
          margin="normal" 
          required 
          fullWidth 
          label="Password" 
          type="password" 
          autoComplete="current-password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        
        <Button
          type="submit" 
          fullWidth 
          variant="contained" 
          disabled={isSubmitting}
          sx={{ py: 1.5, mt: 3, mb: 2 }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
        >
          {isSubmitting ? 'Signing In...' : 'Login'}
        </Button>

        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Don't have an account?{' '}
          <MuiLink component={RouterLink} to="/register" variant="body2" sx={{ fontWeight: 'bold' }}>
            Sign Up
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
