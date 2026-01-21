// src/components/auth/ChangeDetailsModal.tsx
/**
 * Change Details Modal Component
 * 
 * This component displays a modal dialog for updating user account details.
 * It includes fields for address, phone, and class, with validation and
 * API integration for updates.
 */
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, useTheme, Alert, CircularProgress, Typography, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { darken } from '@mui/material/styles';
import EditNoteIcon from '@mui/icons-material/EditNote';
import apiClient from '../../api/axiosInstance';
import { useNotifications } from '../../contexts/NotificationsContext';

/**
 * Class Options
 * 
 * Available class/grade options for user details update.
 * Users can select from classes 6 through 10.
 */
const CLASS_OPTIONS = ['6', '7', '8', '9', '10'];

/**
 * Change Details Modal Component
 * 
 * Displays a modal dialog for updating user account details. Features:
 * - Read-only username and email fields (cannot be changed)
 * - Editable address field (required)
 * - Editable phone number field (optional)
 * - Editable class selection (required)
 * - Form validation
 * - Loading state during submission
 * - Success/error notifications
 * 
 * This component is used on the AccountPage to allow users
 * to update their profile information.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {() => void} props.onClose - Callback to close the modal
 * @param {Object} props.currentUser - Current user object with account details
 * @param {(details: Object) => void} props.onUpdateSuccess - Callback when update succeeds
 * @returns {JSX.Element} Change details modal dialog
 */
function ChangeDetailsModal({ open, onClose, currentUser, onUpdateSuccess }) {
  // Get theme for styling
  const theme = useTheme();
  // Get accent color from theme
  const ACCENT_COLOR = theme.palette.primary.main;
  // Get notification context for displaying messages
  const { addNotification } = useNotifications();

  // State for form data (address, class, phone)
  const [formData, setFormData] = useState({
    address: '',
    class: '',
    phone: ''
  });
  // State for error messages (currently unused but kept for compatibility)
  const [error] = useState('');
  // State for submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Initialize Form Data Effect
   * 
   * Populates form fields with current user data when modal opens.
   * Resets form when modal closes.
   */
  useEffect(() => {
    if (currentUser && open) {
      // Set form data with current user's details
      setFormData({
        address: currentUser.address || '',
        class: String(currentUser.class || ''),
        phone: currentUser.phone || '' // Set phone state
      });
    }
  }, [currentUser, open]);

  /**
   * Handle Input Change
   * 
   * Updates form data when input fields change.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Update form data with new value for the changed field
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handle Submit
   * 
   * Handles form submission for details update. Validates inputs
   * and calls the API to update user details.
   * 
   * @param {React.FormEvent} event - Form submission event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate required fields
    if (!formData.address.trim() || !formData.class) {
        addNotification("Address and Class are required.", 'warning');
        return;
    }
    
    // Set loading state
    setIsSubmitting(true);
    
    try {
      // Call API to update user details
      await apiClient.put('/api/users/update-details', {
        address: formData.address.trim(),
        class: formData.class,
        phone: formData.phone.trim() // Send phone data
      });
      
      // Show success notification
      addNotification('Details updated successfully!', 'success');
      
      // Call success callback if provided to update context
      if (onUpdateSuccess) {
        onUpdateSuccess({ address: formData.address, class: formData.class, phone: formData.phone }); // Update context
      }
      
      // Close modal on success
      onClose();
    } catch (err) {
      // Extract error message or use default
      const message = err.response?.data?.message || 'Failed to update details.';
      // Show error notification
      addNotification(message, 'error');
    } finally {
      // Always reset loading state
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
           <TextField
            margin="normal"
            fullWidth
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
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