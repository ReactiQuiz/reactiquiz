// src/components/ChallengeSetupModal.js
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl,
  InputLabel, Select, MenuItem, Typography, Box, useTheme, CircularProgress, Alert
} from '@mui/material';
import { darken } from '@mui/material/styles';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import apiClient from '../../api/axiosInstance';

function ChallengeSetupModal({
  open,
  onClose,
  currentUser,
  quizDataForChallenge, // Expected: { topicId, topicName, difficulty, numQuestions, quizClass, questionIds (array of strings), subject }
  accentColor
}) {
  const theme = useTheme();
  const [friendsList, setFriendsList] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveAccentColor = accentColor || theme.palette.secondary.main;

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
    if (!quizDataForChallenge || !quizDataForChallenge.questionIds || quizDataForChallenge.questionIds.length === 0 || !quizDataForChallenge.subject) {
        setError('Quiz data for challenge is incomplete or missing subject.');
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
        num_questions: quizDataForChallenge.questionIds.length, // Use actual length of questionIds
        quiz_class: quizDataForChallenge.quizClass || null,
        question_ids_json: JSON.stringify(quizDataForChallenge.questionIds),
        subject: quizDataForChallenge.subject 
      };
      const response = await apiClient.post('/api/challenges', payload, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setSuccessMessage(response.data.message || 'Challenge sent successfully!');
      setTimeout(() => {
        onClose(); 
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send challenge. They might already be in a challenge or an error occurred.');
      console.error("Error sending challenge:", err.response || err);
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
        <Typography variant="body2" gutterBottom>
          You are about to challenge a friend using the following quiz:
        </Typography>
        <Box sx={{pl:1, borderLeft: `3px solid ${effectiveAccentColor}`, mb:1}}>
            <Typography variant="body2"><strong>Topic:</strong> {quizDataForChallenge?.topicName || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Difficulty:</strong> {quizDataForChallenge?.difficulty || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Questions:</strong> {quizDataForChallenge?.questionIds?.length || 'N/A'}</Typography>
            {quizDataForChallenge?.quizClass && <Typography variant="body2"><strong>Class:</strong> {quizDataForChallenge.quizClass}</Typography>}
            {quizDataForChallenge?.subject && <Typography variant="body2"><strong>Subject:</strong> {quizDataForChallenge.subject}</Typography>}
        </Box>
        
        {isLoadingFriends ? <CircularProgress sx={{alignSelf: 'center', color: effectiveAccentColor}} /> : (
          <FormControl fullWidth margin="normal" disabled={friendsList.length === 0}>
            <InputLabel id="select-friend-label-challenge">Select Friend to Challenge</InputLabel>
            <Select
              labelId="select-friend-label-challenge"
              value={selectedFriendId}
              label="Select Friend to Challenge"
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
            {friendsList.length === 0 && !isLoadingFriends && <Typography variant="caption" color="text.secondary">You have no friends to challenge. Add friends from the 'Manage Friends' page.</Typography>}
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