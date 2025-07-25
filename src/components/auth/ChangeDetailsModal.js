// src/components/ChangeDetailsModal.js
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, useTheme, Alert, CircularProgress, Typography, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { darken } from '@mui/material/styles';
import EditNoteIcon from '@mui/icons-material/EditNote';
import apiClient from '../../api/axiosInstance';

const CLASS_OPTIONS = ['6', '7', '8', '9', '10', '11', '12'];

function ChangeDetailsModal({ open, onClose, currentUser, setCurrentUser }) {
  const theme = useTheme();
  const ACCENT_COLOR = theme.palette.accountAccent?.main || theme.palette.primary.main;

  const [formData, setFormData] = useState({
    identifier: '', // Will be display-only
    email: '',      // Will be display-only
    address: '',
    class: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser && open) {
      setFormData({
        identifier: currentUser.name || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
        class: String(currentUser.class || '') // Ensure class is a string for Select
      });
      setError('');
      setSuccessMessage('');
    }
  }, [currentUser, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    // ... (validation is correct)

    setIsSubmitting(true);
    try {
      // --- THIS IS THE FIX ---
      // The axios interceptor automatically adds the auth token
      await apiClient.put('/api/users/update-details', {
        address: formData.address.trim(),
        class: formData.class,
      });
      // --- END OF FIX ---

      setSuccessMessage('Details updated successfully!');
      // Update the user in the frontend state
      if (setCurrentUser) {
        setCurrentUser(prev => ({ ...prev, address: formData.address, class: formData.class }));
      }
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccessMessage('');
    // Reset formData to current user's details when closing without submitting
    // or rely on useEffect to reset on next open.
    // For now, just closing.
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { minWidth: { xs: '90%', sm: '450px' } } }}>
      <DialogTitle sx={{ backgroundColor: ACCENT_COLOR, color: theme.palette.getContrastText(ACCENT_COLOR), pb: 1.5, pt: 2, textAlign: 'center' }}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <EditNoteIcon sx={{mr: 1}}/>
          Change Your Details
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important' }}>
        <Typography variant="body2" color="text.secondary" sx={{mb:1}}>
            Update your address and class. Username and email cannot be changed here.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            fullWidth
            id="identifier-display"
            label="Username/Identifier"
            name="identifier"
            value={formData.identifier}
            disabled // Make this field read-only
            InputLabelProps={{ shrink: true }} // Ensures label doesn't overlap pre-filled value
          />
          <TextField
            margin="normal"
            fullWidth
            id="email-display"
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            disabled // Make this field read-only
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
            InputLabelProps={{ shrink: !!formData.address }}
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
             {!!error && error.toLowerCase().includes("class") && <Typography color="error" variant="caption">{error}</Typography>}
          </FormControl>

          {error && (!error.toLowerCase().includes("class") && !error.toLowerCase().includes("address")) && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
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
            backgroundColor: ACCENT_COLOR,
            color: theme.palette.getContrastText(ACCENT_COLOR),
            '&:hover': { backgroundColor: darken(ACCENT_COLOR, 0.15) }
          }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangeDetailsModal;