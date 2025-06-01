// src/pages/ChallengesPage.js
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, List, Grid, darken, ListItem, ListItemText, Button,
  CircularProgress, Alert, useTheme, Divider, Chip, Stack, IconButton, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import apiClient from '../api/axiosInstance';
import { formatTime } from '../utils/formatTime'; // Assuming you have this utility
import { subjectAccentColors } from '../theme';

const formatTopicNameForChallenge = (topicName, quizClass, difficulty) => {
    let name = topicName || "Unknown Topic";
    if (quizClass) name += ` (Class ${quizClass})`;
    if (difficulty) name += ` - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
    return name;
};


function ChallengesPage({ currentUser }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const [pendingReceivedChallenges, setPendingReceivedChallenges] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [pendingError, setPendingError] = useState('');

  const [challengeHistory, setChallengeHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const [authStatusResolved, setAuthStatusResolved] = useState(currentUser !== undefined && currentUser !== null);

  const fetchAllChallengeData = useCallback(async () => {
    if (!currentUser?.token) return;

    setIsLoadingPending(true);
    setPendingError('');
    try {
      const pendingRes = await apiClient.get('/api/challenges/pending', {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setPendingReceivedChallenges(pendingRes.data || []);
    } catch (err) {
      setPendingError(err.response?.data?.message || "Failed to load pending challenges.");
    } finally {
      setIsLoadingPending(false);
    }

    setIsLoadingHistory(true);
    setHistoryError('');
    try {
      const historyRes = await apiClient.get('/api/challenges/history', {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setChallengeHistory(historyRes.data || []);
    } catch (err) {
      setHistoryError(err.response?.data?.message || "Failed to load challenge history.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser !== undefined) {
      setAuthStatusResolved(true);
      if (currentUser) {
        fetchAllChallengeData();
      }
    }
  }, [currentUser, fetchAllChallengeData]);

  const handleStartChallenge = (challenge) => {
    navigate(`/quiz/challenge-${challenge.id}`, { // Use a distinct path or rely on state
        state: {
            quizType: 'challenge',
            challengeId: challenge.id,
            topicId: challenge.topic_id, // Will be used by QuizPage to fetch questions
            topicName: challenge.topic_name || `Challenge #${challenge.id}`,
            difficulty: challenge.difficulty,
            numQuestions: challenge.num_questions,
            quizClass: challenge.quiz_class,
            // Pass question_ids if backend GET /api/challenges/:id returns them
            // and QuizPage is modified to use them directly
            questionIds: challenge.question_ids_json ? JSON.parse(challenge.question_ids_json) : null,
            subject: challenge.subject || challenge.topic_id.split('-')[0] || 'challenge', // Derive subject for accent
            timeLimit: challenge.time_limit || null, // If challenges have time limits
            currentChallengeDetails: challenge // Pass the whole challenge object
        }
    });
  };

  if (!authStatusResolved) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', maxWidth: '600px', margin: 'auto', mt: 4 }}>
        <Paper elevation={3} sx={{p:3}}>
            <Typography variant="h6">Please log in to view and manage challenges.</Typography>
            <Button variant="contained" onClick={() => navigate('/account')} sx={{mt: 2}}>Go to Login</Button>
        </Paper>
      </Box>
    );
  }

  const renderChallengeItem = (challenge, type) => {
    const isCurrentUserChallenger = challenge.challenger_id === currentUser.id;
    const opponentUsername = isCurrentUserChallenger ? challenge.challengedUsername : challenge.challengerUsername;
    const currentUserScore = isCurrentUserChallenger ? challenge.challenger_score : challenge.challenged_score;
    const opponentScore = isCurrentUserChallenger ? challenge.challenged_score : challenge.challenger_score;
    const currentUserTime = isCurrentUserChallenger ? challenge.challenger_time_taken : challenge.challenged_time_taken;
    const opponentTime = isCurrentUserChallenger ? challenge.challenged_time_taken : challenge.challenger_time_taken;


    let statusText = challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1);
    let statusColor = "default";
    if (challenge.status === 'pending' && type === 'received') statusColor = "warning";
    if (challenge.status === 'pending' && type === 'sent') statusColor = "info";
    if (challenge.status === 'challenger_completed' && type === 'received') statusColor = "info";
    if (challenge.status === 'completed') {
        if (challenge.winner_id === null) {
            statusText = "Tie"; statusColor = "info";
        } else if (challenge.winner_id === currentUser.id) {
            statusText = "You Won!"; statusColor = "success";
        } else {
            statusText = `${challenge.winnerUsername || 'Opponent'} Won`; statusColor = "error";
        }
    }
    if (challenge.status === 'declined') { statusColor = "error"; statusText = "Declined"; }
    if (challenge.status === 'expired') { statusColor = "default"; statusText = "Expired"; }


    return (
        <Paper key={challenge.id} elevation={2} sx={{ mb: 2, p: 2, borderLeft: `4px solid ${subjectAccentColors[challenge.subject?.toLowerCase()] || theme.palette.grey[500]}` }}>
            <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} sm={8}>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                        {formatTopicNameForChallenge(challenge.topic_name, challenge.quiz_class, challenge.difficulty)}
                    </Typography>
                    {type === 'received' && (
                        <Typography variant="body2" color="text.secondary">
                            Challenged by: <strong>{challenge.challengerUsername || 'A user'}</strong>
                        </Typography>
                    )}
                    {type === 'sent' && (
                        <Typography variant="body2" color="text.secondary">
                            You challenged: <strong>{challenge.challengedUsername || 'A user'}</strong>
                        </Typography>
                    )}
                     {type === 'history' && (
                        <Typography variant="body2" color="text.secondary">
                            {isCurrentUserChallenger ? `You vs ${opponentUsername}` : `${opponentUsername} vs You`}
                        </Typography>
                    )}
                    <Typography variant="caption" display="block" color="text.secondary">
                        {new Date(challenge.created_at).toLocaleDateString()}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4} container direction="column" alignItems={{xs: 'flex-start', sm: 'flex-end'}} spacing={0.5}>
                    <Grid item> <Chip label={statusText} color={statusColor} size="small" /> </Grid>
                   
                    {challenge.status === 'completed' && (
                        <>
                        <Grid item>
                            <Typography variant="body2" sx={{textAlign: {xs: 'left', sm: 'right'}}}>
                                Your Score: {currentUserScore ?? 'N/A'}/{challenge.num_questions}
                                {currentUserTime !== null && ` (${formatTime(currentUserTime)})`}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body2" sx={{textAlign: {xs: 'left', sm: 'right'}}}>
                                Opponent: {opponentScore ?? 'N/A'}/{challenge.num_questions}
                                {opponentTime !== null && ` (${formatTime(opponentTime)})`}
                            </Typography>
                        </Grid>
                        </>
                    )}
                    {(challenge.status === 'pending' || (challenge.status === 'challenger_completed' && challenge.challenged_id === currentUser.id)) && type === 'received' && (
                        <Grid item sx={{mt:1}}>
                            <Button 
                                variant="contained" 
                                size="small" 
                                startIcon={<SportsKabaddiIcon />}
                                onClick={() => handleStartChallenge(challenge)}
                                sx={{backgroundColor: theme.palette.secondary.main, '&:hover': {backgroundColor: darken(theme.palette.secondary.main, 0.2)}}}
                            >
                                Play Challenge
                            </Button>
                        </Grid>
                    )}
                    {challenge.status === 'pending' && type === 'sent' && (
                        <Grid item sx={{mt:1}}>
                             <Typography variant="caption" color="text.secondary">Waiting for opponent</Typography>
                        </Grid>
                    )}
                     {challenge.status === 'challenger_completed' && type === 'sent' && (
                        <Grid item sx={{mt:1}}>
                             <Typography variant="caption" color="text.secondary">You played. Waiting for opponent.</Typography>
                        </Grid>
                    )}


                </Grid>
            </Grid>
        </Paper>
    );
  }


  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.light, fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
        <SportsKabaddiIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.3em' }} />
        My Challenges
      </Typography>

      {/* Pending Received Challenges */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: theme.palette.secondary.main }}>Incoming Challenges</Typography>
        {isLoadingPending && <CircularProgress />}
        {pendingError && <Alert severity="error">{pendingError}</Alert>}
        {!isLoadingPending && pendingReceivedChallenges.length === 0 && !pendingError && (
          <Typography color="text.secondary">No pending challenges received.</Typography>
        )}
        {pendingReceivedChallenges.map(challenge => renderChallengeItem(challenge, 'received'))}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Challenge History (Sent & Completed/Declined/Expired) */}
      <Box>
        <Typography variant="h5" gutterBottom>Challenge History</Typography>
        {isLoadingHistory && <CircularProgress />}
        {historyError && <Alert severity="error">{historyError}</Alert>}
        {!isLoadingHistory && challengeHistory.length === 0 && !historyError && (
          <Typography color="text.secondary">No past challenges found.</Typography>
        )}
        {challengeHistory.map(challenge => renderChallengeItem(challenge, 'history'))}
      </Box>
    </Box>
  );
}

export default ChallengesPage;