// src/components/core/NotificationManager.js
import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNotifications } from '../../contexts/NotificationsContext';

function NotificationManager() {
  const { notifications, removeNotification } = useNotifications();
  const [currentNotification, setCurrentNotification] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // If we have a notification in the queue and the snackbar isn't already open, show the next one.
    if (notifications.length > 0 && !currentNotification) {
      setCurrentNotification(notifications[0]);
      setOpen(true);
    }
  }, [notifications, currentNotification]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleExited = () => {
    // When the snackbar has finished its exit animation, remove it from the queue
    // and reset the current notification.
    if (currentNotification) {
      removeNotification(currentNotification.id);
    }
    setCurrentNotification(null);
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000} // Hide after 5 seconds
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={currentNotification.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {currentNotification.message}
      </Alert>
    </Snackbar>
  );
}

export default NotificationManager;