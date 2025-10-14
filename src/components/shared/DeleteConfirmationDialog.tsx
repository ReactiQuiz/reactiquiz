import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Alert, useTheme
} from '@mui/material';

function DeleteConfirmationDialog({ open, onClose, onConfirm, error }) {
  const theme = useTheme();
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="delete-confirmation-title">
      <DialogTitle id="delete-confirmation-title">Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this quiz result? This action cannot be undone.
        </DialogContentText>
        {error && <Alert severity="error" sx={{ mt: 2 }} variant="filled">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: theme.palette.text.secondary }}>Cancel</Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteConfirmationDialog;