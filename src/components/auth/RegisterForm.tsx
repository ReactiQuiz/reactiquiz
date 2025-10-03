// src/components/auth/RegisterForm.tsx
import React, { useState, FormEvent } from 'react';
import { Box, Typography, Alert, TextField, Link as MuiLink, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import HomeIcon from '@mui/icons-material/Home';
import { motion } from 'framer-motion';
import { RegisterFormProps } from '../../types';
import LiquidGlassButton from '../animations/LiquidGlassButton';
import ShaderAnimationAuth from '../animations/ShaderAnimationAuth';

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
            className="text-center mb-4"
          >
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
                <PersonAddIcon sx={{ fontSize: 28, color: 'white' }} />
              </div>
            </div>
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: '1.75rem' }
              }}
            >
              Create Your Account
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.85rem'
              }}
            >
              Join ReactiQuiz and start your learning journey
            </Typography>
          </motion.div>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Username Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <TextField 
                margin="dense" 
                required 
                fullWidth 
                label="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />,
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    height: '48px',
                    fontSize: '1rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' },
                  '& .MuiOutlinedInput-input': { color: 'white', fontSize: '1rem' },
                }}
              />
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <TextField 
                margin="dense" 
                required 
                fullWidth 
                label="Email Address" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />,
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    height: '48px',
                    fontSize: '1rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' },
                  '& .MuiOutlinedInput-input': { color: 'white', fontSize: '1rem' },
                }}
              />
            </motion.div>

            {/* Phone Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <TextField 
                margin="dense" 
                fullWidth 
                label="Phone Number (Optional)" 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />,
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    height: '48px',
                    fontSize: '1rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' },
                  '& .MuiOutlinedInput-input': { color: 'white', fontSize: '1rem' },
                }}
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <TextField 
                margin="dense" 
                required 
                fullWidth 
                label="Password (min. 6 chars)" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />,
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    height: '48px',
                    fontSize: '1rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' },
                  '& .MuiOutlinedInput-input': { color: 'white', fontSize: '1rem' },
                }}
              />
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <TextField 
                margin="dense" 
                required 
                fullWidth 
                label="Confirm Password" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />,
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    height: '48px',
                    fontSize: '1rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' },
                  '& .MuiOutlinedInput-input': { color: 'white', fontSize: '1rem' },
                }}
              />
            </motion.div>

            {/* Address Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <TextField 
                margin="dense" 
                required 
                fullWidth 
                label="Address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                InputProps={{
                  startAdornment: <HomeIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />,
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    height: '48px',
                    fontSize: '1rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' },
                  '& .MuiOutlinedInput-input': { color: 'white', fontSize: '1rem' },
                }}
              />
            </motion.div>

            {/* Class Select */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <FormControl 
                fullWidth 
                margin="dense" 
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    height: '48px',
                    fontSize: '1rem',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' },
                  '& .MuiSelect-select': { color: 'white', fontSize: '1rem' },
                  '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              >
                <InputLabel 
                  id="class-select-label"
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      marginRight: '8px',
                      backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" fill="rgba(255,255,255,0.5)" viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>')}")`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                    }
                  }}
                >
                  Class
                </InputLabel>
                <Select
                  labelId="class-select-label"
                  value={userClass}
                  label="Class"
                  onChange={(e) => setUserClass(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        '& .MuiMenuItem-root': {
                          color: 'white',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&.Mui-selected': {
                            background: 'rgba(16, 185, 129, 0.2)',
                            '&:hover': {
                              background: 'rgba(16, 185, 129, 0.3)',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value=""><em>Select Class</em></MenuItem>
                  {CLASS_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}th
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </motion.div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Alert 
                  severity="error" 
                sx={{ 
                  mb: 1.5,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  '& .MuiAlert-icon': { color: '#f87171' }
                }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <LiquidGlassButton
                type="submit" 
                variant="secondary"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                sx={{
                  width: '100%',
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  mb: 3,
                  height: '48px',
                }}
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </LiquidGlassButton>
            </motion.div>
            
            {/* Sign In Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="text-center"
            >
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Already have an account?{' '}
                <MuiLink 
                  component={RouterLink} 
                  to="/login" 
                  sx={{ 
                    color: '#34d399',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { 
                      textDecoration: 'underline',
                      color: '#10b981'
                    }
                  }}
                >
                  Sign In
                </MuiLink>
              </Typography>
            </motion.div>
          </Box>
        </div>
      </motion.div>
    </Box>
  );
};

export default RegisterForm;
