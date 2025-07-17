// src/components/friends/FriendSearch.js
import { useState } from 'react';
import {
  Box, Typography, TextField, Button, CircularProgress,
  List, ListItem, ListItemText, Tooltip, useTheme
} from '@mui/material';
import { darken } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import apiClient from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import StatusAlert from '../shared/StatusAlert'; // Import the new component

function FriendSearch({ accentColor }) {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [friendSearchTerm, setFriendSearchTerm] = useState('');
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [friendSearchError, setFriendSearchError] = useState('');
  const [friendRequestStatus, setFriendRequestStatus] = useState({});

  const effectiveAccentColor = accentColor || theme.palette.info.main;

  const handleSearchUsers = async () => {
    if (!currentUser || !currentUser.token) {
      setFriendSearchError('You must be logged in to search for users.');
      return;
    }
    if (!friendSearchTerm.trim() || friendSearchTerm.trim().length < 2) {
      setFriendSearchError('Please enter at least 2 characters to search.');
      setSearchedUsers([]);
      return;
    }
    setIsSearchingUsers(true);
    setFriendSearchError('');
    setFriendRequestStatus({});
    try {
      const response = await apiClient.get(`/api/users/search?username=${friendSearchTerm.trim()}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setSearchedUsers(response.data || []);
      if (response.data.length === 0) {
        setFriendSearchError('No users found matching your search.');
      }
    } catch (err) {
      setFriendSearchError(err.response?.data?.message || "Error searching for users.");
      setSearchedUsers([]);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const handleSendFriendRequest = async (receiverUsername) => {
    if (!currentUser || !currentUser.token) {
        setFriendRequestStatus(prev => ({ ...prev, [receiverUsername]: 'Login required' }));
        return;
    }
    setFriendRequestStatus(prev => ({ ...prev, [receiverUsername]: 'sending' }));
    try {
      await apiClient.post('/api/friends/request',
        { receiverUsername },
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      setFriendRequestStatus(prev => ({ ...prev, [receiverUsername]: 'sent' }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error sending request';
      setFriendRequestStatus(prev => ({ ...prev, [receiverUsername]: errorMessage }));
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ color: effectiveAccentColor, opacity: 0.85 }}>
        Find Friends
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TextField
          fullWidth
          label="Search for users by username"
          variant="outlined"
          size="small"
          value={friendSearchTerm}
          onChange={(e) => { setFriendSearchTerm(e.target.value); setFriendSearchError(''); }}
          onKeyPress={(e) => { if (e.key === 'Enter') handleSearchUsers(); }}
        />
        <Button
          onClick={handleSearchUsers}
          variant="contained"
          disabled={isSearchingUsers || !currentUser}
          startIcon={<SearchIcon />}
          sx={{ backgroundColor: effectiveAccentColor, '&:hover': { backgroundColor: darken(effectiveAccentColor, 0.2) } }}
        >
          {isSearchingUsers ? <CircularProgress size={20} color="inherit" /> : "Search"}
        </Button>
      </Box>
      {friendSearchError && <StatusAlert severity="info" message={friendSearchError} sx={{ mb: 1 }} />}
      {searchedUsers.length > 0 && (
        <List dense sx={{ maxHeight: 200, overflow: 'auto', border: `1px solid ${theme.palette.divider}`, borderRadius: 1, mt:1, p: 0.5 }}>
          {searchedUsers.map(user => {
            let buttonText = 'Add Friend';
            let buttonDisabled = false;
            const currentStatus = friendRequestStatus[user.identifier];
            let tooltipTitle = 'Send a friend request';
            let buttonSx = { minWidth: '130px', textTransform: 'none' };

            if (currentStatus === 'sending') {
              buttonText = 'Sending...'; buttonDisabled = true; tooltipTitle = 'Please wait...';
            } else if (currentStatus === 'sent') {
              buttonText = 'Request Sent'; buttonDisabled = true; tooltipTitle = 'Your request has been sent!'; buttonSx.color = theme.palette.success.main;
            } else if (currentStatus && currentStatus !== 'Login required') {
              buttonText = 'Add Friend'; buttonDisabled = false; tooltipTitle = currentStatus; // Show error in tooltip
            } else if (currentStatus === 'Login required') {
              buttonText = 'Login Required'; buttonDisabled = true; tooltipTitle = 'You must be logged in.';
            }

            return (
              <ListItem
                key={user.id}
                secondaryAction={
                  <Tooltip title={tooltipTitle} placement="top">
                    <span>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleSendFriendRequest(user.identifier)}
                        disabled={buttonDisabled || !currentUser}
                        startIcon={currentStatus === 'sending' ? <CircularProgress size={16} color="inherit"/> : <PersonAddAlt1Icon />}
                        sx={buttonSx}
                      >
                        {buttonText}
                      </Button>
                    </span>
                  </Tooltip>
                }
                sx={{pr: '150px'}}
              >
                <ListItemText primary={user.identifier} />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
}

export default FriendSearch;