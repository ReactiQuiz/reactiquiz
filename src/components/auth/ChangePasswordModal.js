// src/components/auth/ChangePasswordModal.js
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, useTheme, CircularProgress } from '@mui/material';
import { darken } from '@mui/material/styles';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import apiClient from '../../api/axiosInstance';
import { useNotifications } from '../../contexts/NotificationsContext';

function ChangePasswordModal({ open, onClose }) {
  const theme = useTheme();
  const { addNotification } = useNotifications();

  // --- START OF FIX: Re-added the missing state and handlers ---
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  // --- END OF FIX ---
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.oldPassword || !formData.newPassword) {
      addNotification('Both fields are required.', 'warning');
      return;
    }
    if (formData.newPassword.length < 6) {
        addNotification('New password must be at least 6 characters long.', 'warning');
        return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post('/api/users/change-password', formData);
      addNotification('Password changed successfully!', 'success');
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password.';
      addNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
      setFormData({ oldPassword: '', newPassword: '' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: '100%', maxWidth: '400px' } }}>
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', gap: 1 }}>
        <VpnKeyIcon />
        Change Password
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important' }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal" required fullWidth name="oldPassword" label="Old Password"
            type="password" autoComplete="current-password" autoFocus
            value={formData.oldPassword} onChange={handleInputChange}
          />
          <TextField
            margin="normal" required fullWidth name="newPassword" label="New Password"
            type="password" autoComplete="new-password"
            value={formData.newPassword} onChange={handleInputChange}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit} variant="contained" disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangePasswordModal;