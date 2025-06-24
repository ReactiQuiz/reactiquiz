// src/components/friends/PendingRequestsList.js
import React from 'react';
import {
  Box, Typography, List, ListItem, ListItemText, IconButton,
  CircularProgress, Alert, Stack, Tooltip, useTheme
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

function PendingRequestsList({
  requests,
  isLoading,
  error,
  onRespond,
  accentColor
}) {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.info.main;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ color: effectiveAccentColor, opacity: 0.85 }}>
        Pending Friend Requests
      </Typography>
      {isLoading && <CircularProgress size={24} sx={{ color: effectiveAccentColor, display: 'block', mx: 'auto' }} />}
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {!isLoading && requests.length === 0 && !error && (
        <Typography color="text.secondary">No pending friend requests.</Typography>
      )}
      {requests.length > 0 && (
        <List dense sx={{ maxHeight: 200, overflow: 'auto', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
          {requests.map(req => (
            <ListItem
              key={req.requestId}
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Accept Request">
                    <IconButton size="small" sx={{ color: theme.palette.success.main }} onClick={() => onRespond(req.requestId, 'accept')} aria-label="accept friend request">
                      <CheckIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Decline Request">
                    <IconButton size="small" sx={{ color: theme.palette.error.main }} onClick={() => onRespond(req.requestId, 'decline')} aria-label="decline friend request">
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
              sx={{pr: '80px'}} // Ensure space for actions
            >
              <ListItemText primary={req.username} secondary="Wants to be your friend" />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default PendingRequestsList;