// src/components/auth/ChangePasswordModal.tsx
/**
 * Change Password Modal Component
 * 
 * This component displays a modal dialog for changing user password.
 * It includes fields for old password and new password, validation,
 * and API integration for password updates.
 */
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, CircularProgress } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import apiClient from '../../api/axiosInstance';
import { useNotifications } from '../../contexts/NotificationsContext';

/**
 * Change Password Modal Component
 * 
 * Displays a modal dialog for changing user password. Features:
 * - Old password input field
 * - New password input field
 * - Form validation (minimum 6 characters)
 * - Loading state during submission
 * - Success/error notifications
 * 
 * This component is used in the MainLayout and can be triggered
 * from the Navbar account menu or AccountPage.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {() => void} props.onClose - Callback to close the modal
 * @returns {JSX.Element} Change password modal dialog
 */
function ChangePasswordModal({ open, onClose }) {
  // Get notification context for displaying messages
  const { addNotification } = useNotifications();

  // --- START OF FIX: Re-added the missing state and handlers ---
  // State for form data (old and new password)
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '' });
  // State for submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  // --- END OF FIX ---
  
  /**
   * Handle Submit
   * 
   * Handles form submission for password change. Validates inputs
   * and calls the API to update the password.
   * 
   * @param {React.FormEvent} event - Form submission event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate that both fields are filled
    if (!formData.oldPassword || !formData.newPassword) {
      addNotification('Both fields are required.', 'warning');
      return;
    }
    
    // Validate minimum password length
    if (formData.newPassword.length < 6) {
        addNotification('New password must be at least 6 characters long.', 'warning');
        return;
    }
    
    // Set loading state
    setIsSubmitting(true);
    
    try {
      // Call API to change password
      await apiClient.post('/api/users/change-password', formData);
      // Show success notification
      addNotification('Password changed successfully!', 'success');
      // Close modal on success
      onClose();
    } catch (err) {
      // Extract error message or use default
      const message = err.response?.data?.message || 'Failed to change password.';
      // Show error notification
      addNotification(message, 'error');
    } finally {
      // Always reset loading state and form data
      setIsSubmitting(false);
      setFormData({ oldPassword: '', newPassword: '' });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      PaperProps={{ sx: { width: '100%', maxWidth: '400px' } }}
    >
      {/* Dialog Title with Primary Color Background */}
      <DialogTitle 
        sx={{ 
          backgroundColor: 'primary.main', 
          color: 'primary.contrastText', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1 
        }}
      >
        <VpnKeyIcon />
        Change Password
      </DialogTitle>
      
      {/* Dialog Content with Form Fields */}
      <DialogContent sx={{ pt: '20px !important' }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Old Password Field */}
          <TextField
            margin="normal" 
            required 
            fullWidth 
            name="oldPassword" 
            label="Old Password"
            type="password" 
            autoComplete="current-password" 
            autoFocus
            value={formData.oldPassword} 
            onChange={handleInputChange}
          />
          
          {/* New Password Field */}
          <TextField
            margin="normal" 
            required 
            fullWidth 
            name="newPassword" 
            label="New Password"
            type="password" 
            autoComplete="new-password"
            value={formData.newPassword} 
            onChange={handleInputChange}
          />
        </Box>
      </DialogContent>
      
      {/* Dialog Actions - Cancel and Save Buttons */}
      <DialogActions sx={{ p: '16px 24px' }}>
        {/* Cancel Button */}
        <Button onClick={onClose}>
          Cancel
        </Button>
        
        {/* Save Button - Shows loading spinner when submitting */}
        <Button
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangePasswordModal;