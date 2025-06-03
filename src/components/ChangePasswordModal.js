// src/components/ChangePasswordModal.js
import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, useTheme, Alert, CircularProgress, IconButton
} from '@mui/material';
import { darken } from '@mui/material/styles';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import apiClient from '../api/axiosInstance';

function ChangePasswordModal({ open, onClose, currentUser }) {
  const theme = useTheme();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const effectiveAccentColor = theme.palette.accountAccent?.main || theme.palette.success.main; 

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setSuccessMessage('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (!currentUser || !currentUser.token) {
        setError('User not authenticated. Please log in again.');
        return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/api/users/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setSuccessMessage(response.data.message || 'Password changed successfully!');
      setTimeout(() => {
        handleClose();
      }, 2000); 
    } catch (err) { // <<< ADDED CURLY BRACES HERE
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally { // <<< AND HERE
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { minWidth: { xs: '90%', sm: '450px' } } }}>
      <DialogTitle sx={{ backgroundColor: effectiveAccentColor, color: theme.palette.getContrastText(effectiveAccentColor), pb: 1.5, pt: 2, textAlign: 'center' }}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <VpnKeyIcon sx={{mr: 1}}/>
          Change Your Password
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important' }}>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="oldPassword"
            label="Old Password"
            type={showOldPassword ? 'text' : 'password'}
            id="old-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            error={!!error && (oldPassword.length === 0 || error.toLowerCase().includes("old password"))}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end">
                  {showOldPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password (min. 6 chars)"
            type={showNewPassword ? 'text' : 'password'}
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!error && (newPassword.length === 0 || error.toLowerCase().includes("new password") || newPassword.length < 6)}
             InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmNewPassword"
            label="Confirm New Password"
            type={showConfirmNewPassword ? 'text' : 'password'}
            id="confirm-new-password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            error={!!error && (confirmNewPassword.length === 0 || newPassword !== confirmNewPassword)}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} edge="end">
                  {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
        <Button onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            backgroundColor: effectiveAccentColor,
            color: theme.palette.getContrastText(effectiveAccentColor),
            '&:hover': { backgroundColor: darken(effectiveAccentColor, 0.15) }
          }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Changing...' : 'Change Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangePasswordModal;