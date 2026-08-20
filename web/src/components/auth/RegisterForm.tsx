// src/components/auth/RegisterForm.tsx
/**
 * Register Form
 *
 * The sign-up panel matched from Register.dc.html — a plain cream card,
 * consistent with LoginForm. Replaces the previous dark glassmorphism
 * version, which hardcoded white-on-transparent text.
 */
import React, { useState, FormEvent } from 'react';
import { Box, Typography, Alert, TextField, Link as MuiLink, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { motion } from 'framer-motion';
import { RegisterFormProps } from '../../types';
import LiquidGlassButton from '../animations/LiquidGlassButton';

const CLASS_OPTIONS: string[] = ['6', '7', '8', '9', '10', '11', '12'];

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isSubmitting, error }) => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [userClass, setUserClass] = useState<string>('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit({ username, email, password, confirmPassword, address, phone, userClass, class: userClass });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 3, py: 6 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: 440 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'secondary.main', mb: 2.5 }}>
          <PersonAddIcon sx={{ color: 'background.default', fontSize: 24 }} />
        </Box>

        <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' } }}>Create your account</Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 3, color: 'text.secondary' }}>
          Join ReactiQuiz and start your learning journey.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField margin="dense" required fullWidth label="Username" value={username} onChange={(e) => setUsername(e.target.value)} sx={{ mb: 1 }} />
          <TextField margin="dense" required fullWidth type="email" label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 1 }} />
          <TextField margin="dense" fullWidth type="tel" label="Phone number (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} sx={{ mb: 1 }} />
          <TextField margin="dense" required fullWidth type="password" label="Password (min. 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 1 }} />
          <TextField margin="dense" required fullWidth type="password" label="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} sx={{ mb: 1 }} />
          <TextField margin="dense" required fullWidth label="Address" value={address} onChange={(e) => setAddress(e.target.value)} sx={{ mb: 1 }} />

          <FormControl fullWidth margin="dense" required sx={{ mb: 2 }}>
            <InputLabel id="class-select-label">Class</InputLabel>
            <Select labelId="class-select-label" value={userClass} label="Class" onChange={(e) => setUserClass(e.target.value)}>
              <MenuItem value=""><em>Select class</em></MenuItem>
              {CLASS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>{option}th</MenuItem>
              ))}
            </Select>
          </FormControl>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <LiquidGlassButton
            type="submit"
            variant="secondary"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{ width: '100%' }}
          >
            {isSubmitting ? 'Creating account…' : 'Sign up'}
          </LiquidGlassButton>

          <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
            Already have an account?{' '}
            <MuiLink component={RouterLink} to="/login" sx={{ color: 'secondary.dark', fontWeight: 600 }}>
              Sign in
            </MuiLink>
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default RegisterForm;
