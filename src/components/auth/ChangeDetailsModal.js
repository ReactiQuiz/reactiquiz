// src/components/auth/ChangeDetailsModal.js
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, useTheme, Alert, CircularProgress, Typography, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { darken } from '@mui/material/styles';
import EditNoteIcon from '@mui/icons-material/EditNote';
import apiClient from '../../api/axiosInstance';
import { useNotifications } from '../../contexts/NotificationsContext';

const CLASS_OPTIONS = ['6', '7', '8', '9', '10', '11', '12'];

// --- START OF FIX: Change prop from 'setCurrentUser' to 'onUpdateSuccess' ---
function ChangeDetailsModal({ open, onClose, currentUser, onUpdateSuccess }) {
// --- END OF FIX ---
  const theme = useTheme();
  const ACCENT_COLOR = theme.palette.accountAccent?.main || theme.palette.primary.main;
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    address: '',
    class: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser && open) {
      setFormData({
        address: currentUser.address || '',
        class: String(currentUser.class || '')
      });
      setError('');
      setSuccessMessage('');
    }
  }, [currentUser, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

   const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.address.trim() || !formData.class) {
        addNotification("Address and Class are required.", 'warning');
        return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.put('/api/users/update-details', {
        address: formData.address.trim(),
        class: formData.class,
      });
      addNotification('Details updated successfully!', 'success'); // <-- Success notification
      
      if (onUpdateSuccess) {
        onUpdateSuccess({ address: formData.address, class: formData.class });
      }
      onClose(); // Close the modal immediately on success
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update details.';
      addNotification(message, 'error'); // <-- Error notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { minWidth: { xs: '90%', sm: '450px' } } }}>
      <DialogTitle sx={{ backgroundColor: ACCENT_COLOR, color: theme.palette.getContrastText(ACCENT_COLOR), pb: 1.5, pt: 2, textAlign: 'center' }}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <EditNoteIcon sx={{mr: 1}}/>
          Change Your Details
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important' }}>
        <Typography variant="body2" color="text.secondary" sx={{mb:1}}>
            Update your address and class. Username and email cannot be changed.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            fullWidth
            label="Username"
            value={currentUser?.name || ''}
            disabled
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Email Address"
            value={currentUser?.email || ''}
            disabled
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="address-change"
            label="Address"
            name="address"
            autoComplete="street-address"
            multiline
            rows={2}
            value={formData.address}
            onChange={handleInputChange}
            error={!!error && error.toLowerCase().includes("address")}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="normal" required error={!!error && error.toLowerCase().includes("class")}>
            <InputLabel id="class-select-label">Class</InputLabel>
            <Select
              labelId="class-select-label"
              id="class-change-select"
              name="class"
              value={formData.class}
              label="Class"
              onChange={handleInputChange}
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
          {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{ backgroundColor: ACCENT_COLOR, '&:hover': { backgroundColor: darken(ACCENT_COLOR, 0.15) } }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangeDetailsModal;