// src/components/friends/FriendSearch.js
import { useState } from 'react';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  List, ListItem, ListItemText, Tooltip, useTheme
} from '@mui/material';
import { darken } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import apiClient from '../../api/axiosInstance'; // Adjust path if needed
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed

function FriendSearch({ accentColor }) {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [friendSearchTerm, setFriendSearchTerm] = useState('');
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [friendSearchError, setFriendSearchError] = useState('');
  const [friendRequestStatus, setFriendRequestStatus] = useState({}); // Tracks status per user

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
    setFriendRequestStatus({}); // Reset statuses on new search
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
      // eslint-disable-next-line
      const response = await apiClient.post('/api/friends/request',
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
      {friendSearchError && <Alert severity="info" sx={{ mb: 1 }}>{friendSearchError}</Alert>}
      {searchedUsers.length > 0 && (
        <List dense sx={{ maxHeight: 200, overflow: 'auto', border: `1px solid ${theme.palette.divider}`, borderRadius: 1, mt:1 }}>
          {searchedUsers.map(user => {
            let buttonText = 'Add Friend';
            let buttonDisabled = false;
            let buttonColor = "primary"; // Default color
            const currentStatus = friendRequestStatus[user.identifier];

            if (currentStatus === 'sending') {
              buttonText = 'Sending...'; buttonDisabled = true;
            } else if (currentStatus === 'sent') {
              buttonText = 'Request Sent'; buttonDisabled = true; buttonColor = "success";
            } else if (currentStatus && currentStatus !== 'Login required') {
              buttonText = currentStatus; buttonDisabled = true; buttonColor = "error"; // If status is an error message
            } else if (currentStatus === 'Login required') {
              buttonText = 'Login Required'; buttonDisabled = true; buttonColor = "warning";
            }


            return (
              <ListItem
                key={user.id}
                secondaryAction={
                  <Tooltip title={buttonText} placement="top">
                    <span> {/* Span for Tooltip on disabled button */}
                      <Button
                        size="small"
                        variant="outlined"
                        color={buttonColor}
                        onClick={() => handleSendFriendRequest(user.identifier)}
                        disabled={buttonDisabled || !currentUser}
                        startIcon={currentStatus === 'sending' ? <CircularProgress size={16} color="inherit"/> : <PersonAddAlt1Icon />}
                        sx={{ minWidth: '130px', textTransform: 'none' }}
                      >
                        {buttonText}
                      </Button>
                    </span>
                  </Tooltip>
                }
                sx={{pr: '150px'}} // Ensure space for the action button
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