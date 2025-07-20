// src/components/auth/RegisterForm.js
import React from 'react';
import { Box, TextField, Button, Alert, CircularProgress, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function RegisterForm({
  formError, successMessage, isSubmitting,
  identifier, setIdentifier, email, setEmail,
  password, setPassword, confirmPassword, setConfirmPassword,
  address, setAddress, userClass, setUserClass,
  onRegisterSubmit, accentColor
}) {

  return (
    <Box width="100%">
      <Box component="form" onSubmit={onRegisterSubmit} noValidate sx={{ mt: 1 }}>
        <TextField margin="normal" required fullWidth label="Username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <TextField margin="normal" required fullWidth label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField margin="normal" required fullWidth label="Password (min. 6 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <TextField margin="normal" required fullWidth label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <TextField margin="normal" required fullWidth label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <TextField
          margin="normal" required fullWidth label="Class (e.g., 6-12)" type="number"
          value={userClass} onChange={(e) => setUserClass(e.target.value)}
        />
        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
        <Button type="submit" fullWidth variant="contained" disabled={isSubmitting} sx={{ mt: 2, mb: 1, py: 1.5, backgroundColor: accentColor }}>
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </Box>
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        Already have an account?{' '}
        <MuiLink component={RouterLink} to="/login" variant="body2" sx={{ fontWeight: 'bold' }}>
          Sign In
        </MuiLink>
      </Typography>
    </Box>
  );
}

export default RegisterForm;