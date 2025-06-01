// src/components/ChallengeSetupModal.js
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl,
  InputLabel, Select, MenuItem, Typography, Box, useTheme, CircularProgress, Alert
} from '@mui/material';
import { darken } from '@mui/material/styles';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import apiClient from '../api/axiosInstance';

function ChallengeSetupModal({
  open,
  onClose,
  currentUser,
  quizDataForChallenge, // { topicId, topicName, difficulty, numQuestions, quizClass, questionIds (array of strings) }
  accentColor
}) {
  const theme = useTheme();
  const [friendsList, setFriendsList] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveAccentColor = accentColor || theme.palette.secondary.main; // Challenges often use secondary

  const fetchFriends = useCallback(async () => {
    if (!currentUser?.token) return;
    setIsLoadingFriends(true);
    setError('');
    try {
      const response = await apiClient.get('/api/friends', {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setFriendsList(response.data || []);
    } catch (err) {
      setError('Failed to load your friends list.');
      console.error("Error fetching friends:", err);
    } finally {
      setIsLoadingFriends(false);
    }
  }, [currentUser?.token]);

  useEffect(() => {
    if (open) {
      fetchFriends();
      setSelectedFriendId('');
      setError('');
      setSuccessMessage('');
      setIsSubmitting(false);
    }
  }, [open, fetchFriends]);

  const handleSendChallenge = async () => {
    if (!selectedFriendId) {
      setError('Please select a friend to challenge.');
      return;
    }
    if (!quizDataForChallenge || !quizDataForChallenge.questionIds) {
        setError('Quiz data for challenge is incomplete.');
        return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        challenged_friend_id: selectedFriendId,
        topic_id: quizDataForChallenge.topicId,
        topic_name: quizDataForChallenge.topicName,
        difficulty: quizDataForChallenge.difficulty,
        num_questions: quizDataForChallenge.numQuestions,
        quiz_class: quizDataForChallenge.quizClass || null,
        question_ids_json: JSON.stringify(quizDataForChallenge.questionIds), // Send the exact question IDs
        // subject will be derived by backend or could be passed if available in quizDataForChallenge
      };
      const response = await apiClient.post('/api/challenges', payload, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setSuccessMessage(response.data.message || 'Challenge sent successfully!');
      setTimeout(() => {
        onClose(); // Close modal on success
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send challenge. They might already be in a challenge or an error occurred.');
      console.error("Error sending challenge:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { minWidth: '320px', maxWidth: '500px' } }}>
      <DialogTitle sx={{ backgroundColor: effectiveAccentColor, color: theme.palette.getContrastText(effectiveAccentColor), pb: 1.5, pt: 2 }}>
        Challenge a Friend
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body1">
          You are about to challenge a friend with the quiz: <br/>
          <strong>Topic:</strong> {quizDataForChallenge?.topicName || 'N/A'} <br/>
          <strong>Difficulty:</strong> {quizDataForChallenge?.difficulty || 'N/A'} <br/>
          <strong>Questions:</strong> {quizDataForChallenge?.numQuestions || 'N/A'}
          {quizDataForChallenge?.quizClass && ` (Class: ${quizDataForChallenge.quizClass})`}
        </Typography>
        
        {isLoadingFriends ? <CircularProgress sx={{alignSelf: 'center'}} /> : (
          <FormControl fullWidth margin="normal" disabled={friendsList.length === 0}>
            <InputLabel id="select-friend-label">Select Friend</InputLabel>
            <Select
              labelId="select-friend-label"
              value={selectedFriendId}
              label="Select Friend"
              onChange={(e) => setSelectedFriendId(e.target.value)}
              MenuProps={{ PaperProps: { sx: { backgroundColor: theme.palette.background.paper } } }}
            >
              <MenuItem value=""><em>-- Select a Friend --</em></MenuItem>
              {friendsList.map((friend) => (
                <MenuItem key={friend.friendId} value={friend.friendId}>
                  {friend.friendUsername}
                </MenuItem>
              ))}
            </Select>
            {friendsList.length === 0 && !isLoadingFriends && <Typography variant="caption" color="text.secondary">You have no friends to challenge yet. Add friends from the 'Manage Friends' page.</Typography>}
          </FormControl>
        )}

        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mt: 1 }}>{successMessage}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} sx={{ color: effectiveAccentColor }}>Cancel</Button>
        <Button
          onClick={handleSendChallenge}
          variant="contained"
          disabled={isSubmitting || isLoadingFriends || !selectedFriendId || friendsList.length === 0}
          sx={{
            backgroundColor: effectiveAccentColor,
            color: theme.palette.getContrastText(effectiveAccentColor),
            '&:hover': { backgroundColor: darken(effectiveAccentColor, 0.2) }
          }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit"/> : <SportsKabaddiIcon />}
        >
          {isSubmitting ? 'Sending...' : 'Send Challenge'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChallengeSetupModal;