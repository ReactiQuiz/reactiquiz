// src/components/core/NotificationManager.tsx
/**
 * Notification Manager Component
 * 
 * This component manages the display of global notifications throughout
 * the application. It displays notifications from the NotificationsContext
 * queue one at a time using Material-UI Snackbar and Alert components.
 */
import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNotifications } from '../../contexts/NotificationsContext';

/**
 * Notification Manager Component
 * 
 * Manages the display of notifications from the global notification queue.
 * Displays notifications one at a time, automatically removes them after
 * 5 seconds or when dismissed by the user.
 * 
 * Features:
 * - Queued notification display (one at a time)
 * - Auto-dismiss after 5 seconds
 * - Manual dismiss via close button
 * - Automatic queue management
 * 
 * @returns {JSX.Element | null} Snackbar with notification or null if no notifications
 */
function NotificationManager() {
  // Get notifications queue and remove function from context
  const { notifications, removeNotification } = useNotifications();
  // State for the currently displayed notification
  const [currentNotification, setCurrentNotification] = useState(null);
  // State for snackbar open/close
  const [open, setOpen] = useState(false);

  /**
   * Show Next Notification Effect
   * 
   * When notifications are available in the queue and no notification
   * is currently being displayed, show the next one from the queue.
   */
  useEffect(() => {
    // If we have a notification in the queue and the snackbar isn't already open, show the next one.
    if (notifications.length > 0 && !currentNotification) {
      // Set the first notification in queue as current
      setCurrentNotification(notifications[0]);
      // Open the snackbar
      setOpen(true);
    }
  }, [notifications, currentNotification]);

  /**
   * Handle Close
   * 
   * Handles closing the notification snackbar. Prevents closing
   * when user clicks away (outside the snackbar).
   * 
   * @param {React.SyntheticEvent | Event} event - Close event
   * @param {string} reason - Reason for closing ('clickaway', 'timeout', etc.)
   */
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    // Don't close if user clicked away (only close on button click or timeout)
    if (reason === 'clickaway') {
      return;
    }
    // Close the snackbar
    setOpen(false);
  };

  /**
   * Handle Exited
   * 
   * Called when the snackbar's exit animation completes.
   * Removes the notification from the queue and resets state
   * to allow the next notification to be displayed.
   */
  const handleExited = () => {
    // When the snackbar has finished its exit animation, remove it from the queue
    // and reset the current notification.
    if (currentNotification) {
      // Remove the notification from the queue
      removeNotification(currentNotification.id);
    }
    // Reset current notification to allow next one to show
    setCurrentNotification(null);
  };

  // Don't render anything if no notification is available
  if (!currentNotification) {
    return null;
  }

  return (
    <Snackbar
      open={open} // Control snackbar visibility
      autoHideDuration={5000} // Hide after 5 seconds
      onClose={handleClose} // Handle close event
      TransitionProps={{ onExited: handleExited }} // Callback when exit animation completes
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Position at bottom center
    >
      <Alert
        onClose={handleClose} // Handle close button click
        severity={currentNotification.severity} // Alert type (success, error, warning, info)
        variant="filled" // Filled variant for better visibility
        sx={{ width: '100%' }} // Full width styling
      >
        {currentNotification.message} {/* Display notification message */}
      </Alert>
    </Snackbar>
  );
}

export default NotificationManager;