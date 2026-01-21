// src/components/shared/DeleteConfirmationDialog.tsx
/**
 * Delete Confirmation Dialog Component
 * 
 * This component displays a confirmation dialog before deleting an item.
 * It shows a warning message and provides cancel/confirm buttons.
 * Also displays error messages if deletion fails.
 */
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Alert, useTheme
} from '@mui/material';

/**
 * Delete Confirmation Dialog Component
 * 
 * Displays a confirmation dialog for destructive actions (deletion).
 * Features:
 * - Warning message about the action being irreversible
 * - Cancel button to abort the action
 * - Delete button (red) to confirm the action
 * - Error message display if deletion fails
 * 
 * This component is used throughout the application when users
 * need to confirm before deleting items like quiz results.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {() => void} props.onClose - Callback to close the dialog
 * @param {() => void} props.onConfirm - Callback to confirm deletion
 * @param {string} [props.error] - Error message to display (optional)
 * @returns {JSX.Element} Delete confirmation dialog
 */
function DeleteConfirmationDialog({ open, onClose, onConfirm, error }) {
  // Get theme for styling
  const theme = useTheme();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      aria-labelledby="delete-confirmation-title"
    >
      {/* Dialog Title */}
      <DialogTitle id="delete-confirmation-title">Confirm Deletion</DialogTitle>
      
      {/* Dialog Content */}
      <DialogContent>
        {/* Warning Message */}
        <DialogContentText>
          Are you sure you want to delete this quiz result? This action cannot be undone.
        </DialogContentText>
        
        {/* Error Alert - Shows if deletion failed */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} variant="filled">
            {error}
          </Alert>
        )}
      </DialogContent>
      
      {/* Dialog Actions - Cancel and Delete buttons */}
      <DialogActions>
        {/* Cancel Button */}
        <Button 
          onClick={onClose} 
          sx={{ color: theme.palette.text.secondary }}
        >
          Cancel
        </Button>
        
        {/* Delete Button - Red color, auto-focused for keyboard users */}
        <Button 
          onClick={onConfirm} 
          color="error" 
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteConfirmationDialog;