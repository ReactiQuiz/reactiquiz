// src/components/friends/FriendsListDisplay.js
import {
  Box, Typography, List, ListItem, ListItemText, IconButton,
  CircularProgress, Alert, Tooltip, useTheme
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import EmptyState from '../shared/EmptyState'; // Ensure this path is correct
import GroupAddIcon from '@mui/icons-material/GroupAdd';

function FriendsListDisplay({
  friends,
  isLoading,
  error,
  onUnfriend,
  accentColor
}) {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.info.main;

  if (friends.length === 0) {
    return (
      <EmptyState
        IconComponent={GroupAddIcon}
        title="Your Friends List is Empty"
        message="Use the search bar above to find and add friends to start challenging them!"
      />
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: effectiveAccentColor, opacity: 0.85 }}>
        My Friends
      </Typography>
      {isLoading && <CircularProgress size={24} sx={{ color: effectiveAccentColor, display: 'block', mx: 'auto' }} />}
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {!isLoading && friends.length === 0 && !error && (
        <Typography color="text.secondary">You currently have no friends. Find some above!</Typography>
      )}
      {friends.length > 0 && (
        <List dense sx={{ maxHeight: 300, overflow: 'auto', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
          {friends.map(friend => (
            <ListItem
              key={friend.friendId}
              secondaryAction={
                <Tooltip title="Unfriend">
                  <IconButton size="small" color="error" onClick={() => onUnfriend(friend)} aria-label={`unfriend ${friend.friendUsername}`}>
                    <PersonRemoveIcon />
                  </IconButton>
                </Tooltip>
              }
              sx={{ pr: '50px' }} // Ensure space for action
            >
              <ListItemText primary={friend.friendUsername} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default FriendsListDisplay;