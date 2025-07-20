// src/components/auth/RegisterForm.js
import React from 'react';
import { Box, TextField, Button, Alert, CircularProgress, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function RegisterForm({
  formError,
  successMessage,
  isSubmitting,
  identifier, setIdentifier,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  address, setAddress,
  userClass, setUserClass,
  onRegisterSubmit,
  accentColor,
}) {

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegisterSubmit();
  }

  return (
    <Box>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField margin="normal" required fullWidth id="register-identifier" label="Username" name="registerIdentifier"
          autoComplete="username" autoFocus value={identifier} onChange={(e) => setIdentifier(e.target.value)} error={!!formError}
        />
        <TextField margin="normal" required fullWidth id="register-email" label="Email Address" name="registerEmail"
          type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!formError}
        />
        <TextField margin="normal" required fullWidth name="registerPassword" label="Password (min. 6 chars)"
          type="password" id="register-password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!formError}
        />
        <TextField margin="normal" required fullWidth name="registerConfirmPassword" label="Confirm Password"
          type="password" id="register-confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!formError || (password !== confirmPassword && confirmPassword.length > 0)}
          helperText={password !== confirmPassword && confirmPassword.length > 0 ? "Passwords do not match" : ""}
        />
        <TextField margin="normal" required fullWidth id="register-address" label="Address" name="registerAddress"
          autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} error={!!formError}
        />
        <TextField
          margin="normal" required fullWidth id="register-class" label="Class (e.g., 6-12)" name="registerClass"
          type="number" value={userClass} onChange={(e) => setUserClass(e.target.value)} error={!!formError && formError.toLowerCase().includes('class')}
        />
        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
        <Button type="submit" fullWidth variant="contained" disabled={isSubmitting}
          sx={{ mt: 2, mb: 1, py: 1.5, backgroundColor: accentColor, '&:hover': { backgroundColor: (theme) => theme.palette.augmentColor({ color: { main: accentColor } }).dark } }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
        >
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