// src/components/auth/RegisterForm.tsx
import React, { useState, FormEvent } from 'react';
import { Box, Typography, Alert, TextField, Button, Link as MuiLink, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { RegisterFormProps } from '../../types';

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
    <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Create Your Account
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
        <TextField 
          margin="dense" 
          required 
          fullWidth 
          label="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <TextField 
          margin="dense" 
          required 
          fullWidth 
          label="Email Address" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <TextField 
          margin="dense" 
          fullWidth 
          label="Phone Number (Optional)" 
          type="tel" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
        />
        <TextField 
          margin="dense" 
          required 
          fullWidth 
          label="Password (min. 6 chars)" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <TextField 
          margin="dense" 
          required 
          fullWidth 
          label="Confirm Password" 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
        />
        <TextField 
          margin="dense" 
          required 
          fullWidth 
          label="Address" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
        />
        <FormControl fullWidth margin="dense" required>
          <InputLabel id="class-select-label">Class</InputLabel>
          <Select
            labelId="class-select-label"
            value={userClass}
            label="Class"
            onChange={(e) => setUserClass(e.target.value)}
          >
            <MenuItem value=""><em>Select Class</em></MenuItem>
            {CLASS_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}th
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Button 
          type="submit" 
          fullWidth 
          variant="contained" 
          disabled={isSubmitting} 
          sx={{ mt: 2, mb: 1, py: 1.5 }}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
        </Button>
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Already have an account?{' '}
          <MuiLink component={RouterLink} to="/login" variant="body2" sx={{ fontWeight: 'bold' }}>
            Sign In
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;
