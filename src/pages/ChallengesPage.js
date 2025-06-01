// src/pages/ChallengesPage.js
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, List, Grid, darken, ListItem, ListItemText, Button,
  CircularProgress, Alert, useTheme, Divider, Chip, Stack 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';


import apiClient from '../api/axiosInstance';
import { formatTime } from '../utils/formatTime'; 
import { subjectAccentColors as themeSubjectAccentColors } from '../theme'; 
import HistoricalResultItem from '../components/HistoricalResultItem'; 
import ChallengeSetupModal from '../components/ChallengeSetupModal'; 

const formatTopicNameForChallenge = (topicName, quizClass, difficulty) => {
    let name = topicName || "Unknown Topic";
    if (quizClass) name += ` (Class ${quizClass})`;
    if (difficulty) name += ` - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
    return name;
};


function ChallengesPage({ currentUser }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const CHALLENGES_ACCENT_COLOR = theme.palette.challengesAccent?.main || theme.palette.secondary.main; 

  const [recentResults, setRecentResults] = useState([]);
  const [isLoadingRecentResults, setIsLoadingRecentResults] = useState(false);
  const [recentResultsError, setRecentResultsError] = useState('');
  const [showAllRecentResults, setShowAllRecentResults] = useState(false);
  const MAX_INITIAL_RECENT_RESULTS = 3;

  const [pendingReceivedChallenges, setPendingReceivedChallenges] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [pendingError, setPendingError] = useState('');

  // REMOVED: Challenge History states
  // const [challengeHistory, setChallengeHistory] = useState([]);
  // const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  // const [historyError, setHistoryError] = useState(''); 

  const [authStatusResolved, setAuthStatusResolved] = useState(currentUser !== undefined && currentUser !== null);

  const [challengeSetupModalOpen, setChallengeSetupModalOpen] = useState(false);
  const [quizDataForChallenge, setQuizDataForChallenge] = useState(null);


  const fetchRecentResults = useCallback(async () => {
    if (!currentUser?.id || !currentUser?.token) return;
    setIsLoadingRecentResults(true);
    setRecentResultsError('');
    try {
      const response = await apiClient.get(`/api/results?userId=${currentUser.id}&limit=5&excludeChallenges=true`, { 
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setRecentResults(response.data || []);
    } catch (err) {
      setRecentResultsError(err.response?.data?.message || "Failed to load recent quiz attempts.");
    } finally {
      setIsLoadingRecentResults(false);
    }
  }, [currentUser]);


  const fetchPendingChallengeData = useCallback(async () => { // Renamed from fetchAllChallengeData
    if (!currentUser?.token) return;

    setIsLoadingPending(true);
    setPendingError('');
    try {
      const pendingRes = await apiClient.get('/api/challenges/pending', {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setPendingReceivedChallenges(pendingRes.data || []);
    } catch (err) {
      console.error("Error fetching pending challenges:", err.response || err);
      setPendingError(err.response?.data?.message || "Failed to load pending challenges.");
    } finally {
      setIsLoadingPending(false);
    }

    // REMOVED: Fetching challenge history
  }, [currentUser]);

  useEffect(() => {
    if (currentUser !== undefined) {
      setAuthStatusResolved(true);
      if (currentUser) {
        fetchRecentResults();
        fetchPendingChallengeData(); // Call the renamed function
      }
    }
  }, [currentUser, fetchPendingChallengeData, fetchRecentResults]);

  const handleOpenChallengeSetupFromRecent = (result) => {
    if (!currentUser) {
        navigate('/account', { state: { from: '/challenges', message: "Please login to challenge a friend." }});
        return;
    }
    if (!result.questionsActuallyAttemptedIds || result.questionsActuallyAttemptedIds.length === 0) {
        alert("Cannot initiate challenge: This result has no question data.");
        return;
    }
    setQuizDataForChallenge({
        topicId: result.topicId,
        topicName: result.topicName || formatTopicNameForChallenge(result.topicId, result.class, result.difficulty), 
        difficulty: result.difficulty,
        numQuestions: result.questionsActuallyAttemptedIds.length,
        quizClass: result.class,
        questionIds: result.questionsActuallyAttemptedIds,
        subject: result.subject 
    });
    setChallengeSetupModalOpen(true);
  };

  const handleStartChallenge = (challenge) => {
    navigate(`/quiz/challenge-${challenge.id}`, { 
        state: {
            quizType: 'challenge',
            challengeId: challenge.id,
            topicId: challenge.topic_id, 
            topicName: challenge.topic_name || `Challenge #${challenge.id}`,
            difficulty: challenge.difficulty,
            numQuestions: challenge.num_questions,
            quizClass: challenge.quiz_class,
            questionIds: challenge.question_ids_json ? JSON.parse(challenge.question_ids_json) : null,
            subject: challenge.subject || challenge.topic_id.split('-')[0] || 'challenge', 
            timeLimit: challenge.time_limit || null, 
            currentChallengeDetails: challenge 
        }
    });
  };

  if (!authStatusResolved) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
            <CircularProgress sx={{ color: CHALLENGES_ACCENT_COLOR }} />
        </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', maxWidth: '600px', margin: 'auto', mt: 4 }}>
        <Paper elevation={3} sx={{p:3}}>
            <Typography variant="h6">Please log in to view and manage challenges.</Typography>
            <Button variant="contained" onClick={() => navigate('/account')} sx={{mt: 2, backgroundColor: CHALLENGES_ACCENT_COLOR, '&:hover': { backgroundColor: darken(CHALLENGES_ACCENT_COLOR, 0.2)}}}>Go to Login</Button>
        </Paper>
      </Box>
    );
  }

  const renderChallengeItem = (challenge, type) => { // 'type' can now just be 'received' or implicitly 'sent' if needed
    const isCurrentUserChallenger = challenge.challenger_id === currentUser.id;
    const opponentUsername = isCurrentUserChallenger ? challenge.challengedUsername : challenge.challengerUsername;
    const currentUserScore = isCurrentUserChallenger ? challenge.challenger_score : challenge.challenged_score;
    const opponentScore = isCurrentUserChallenger ? challenge.challenged_score : challenge.challenger_score;
    const currentUserTime = isCurrentUserChallenger ? challenge.challenger_time_taken : challenge.challenged_time_taken;
    const opponentTime = isCurrentUserChallenger ? challenge.challenged_time_taken : challenge.challenger_time_taken;

    let statusText = challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1);
    let statusColor = "default"; 
    let chipVariant = "filled";

    if (challenge.status === 'pending' && type === 'received') { statusColor = "warning"; chipVariant = "outlined"; }
    // if (challenge.status === 'pending' && type === 'sent') { statusColor = "info"; chipVariant = "outlined"; } // No 'sent' type passed now
    if (challenge.status === 'challenger_completed' && type === 'received') { statusColor = "info"; chipVariant = "outlined"; }
    
    // Note: Challenge History specific rendering logic can be removed if the list is gone
    // However, if these statuses can appear in "Incoming Challenges" in some scenarios, keep them.
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
    if (challenge.status === 'expired') { statusColor = "default"; statusText = "Expired"; chipVariant = "outlined"; }


    return (
        <Paper key={challenge.id} elevation={2} sx={{ mb: 2, p: 2, borderLeft: `4px solid ${themeSubjectAccentColors[challenge.subject?.toLowerCase()] || theme.palette.grey[500]}` }}>
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
                    {/* Removed 'sent' specific display as history is gone */}
                    <Typography variant="caption" display="block" color="text.secondary">
                        {new Date(challenge.created_at).toLocaleDateString()}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4} container direction="column" alignItems={{xs: 'flex-start', sm: 'flex-end'}} spacing={0.5}>
                    <Grid item> <Chip label={statusText} color={statusColor} size="small" variant={chipVariant} /> </Grid>
                   
                    {challenge.status === 'completed' && ( // This might still apply if a completed challenge somehow appears in pending (unlikely)
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
                                sx={{backgroundColor: CHALLENGES_ACCENT_COLOR, '&:hover': {backgroundColor: darken(CHALLENGES_ACCENT_COLOR, 0.2)}}}
                            >
                                Play Challenge
                            </Button>
                        </Grid>
                    )}
                     {/* Removed 'sent' specific display as history is gone */}
                </Grid>
            </Grid>
        </Paper>
    );
  }


  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: CHALLENGES_ACCENT_COLOR, fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
        <SportsKabaddiIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.3em', color: CHALLENGES_ACCENT_COLOR }} />
        My Challenges
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: CHALLENGES_ACCENT_COLOR, opacity: 0.85 }}>Recent Quiz Attempts</Typography>
        {isLoadingRecentResults && <CircularProgress sx={{ color: CHALLENGES_ACCENT_COLOR }} />}
        {recentResultsError && <Alert severity="warning">{recentResultsError}</Alert>}
        {!isLoadingRecentResults && recentResults.length === 0 && !recentResultsError && (
          <Typography color="text.secondary">No recent quiz attempts found to use for challenges.</Typography>
        )}
        <List>
          {recentResults.slice(0, showAllRecentResults ? recentResults.length : MAX_INITIAL_RECENT_RESULTS).map((result) => (
            <HistoricalResultItem 
              key={`recent-${result.id}`} 
              result={result}
              onResultClick={() => handleOpenChallengeSetupFromRecent(result)} 
              showDeleteButton={false} 
            />
          ))}
        </List>
        {recentResults.length > MAX_INITIAL_RECENT_RESULTS && (
          <Box sx={{display: 'flex', justifyContent: 'center', mt: 1}}>
            <Button
                onClick={() => setShowAllRecentResults(!showAllRecentResults)}
                sx={{ color: CHALLENGES_ACCENT_COLOR }}
                size="small"
            >
                {showAllRecentResults ? 'Show Less' : `Show More (${recentResults.length - MAX_INITIAL_RECENT_RESULTS} more)`}
            </Button>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: CHALLENGES_ACCENT_COLOR }}>Incoming Challenges</Typography>
        {isLoadingPending && <CircularProgress sx={{ color: CHALLENGES_ACCENT_COLOR }} />}
        {pendingError && <Alert severity="error">{pendingError}</Alert>}
        {!isLoadingPending && pendingReceivedChallenges.length === 0 && !pendingError && (
          <Typography color="text.secondary">No pending challenges received.</Typography>
        )}
        {pendingReceivedChallenges.map(challenge => renderChallengeItem(challenge, 'received'))}
      </Box>

      {/* REMOVED Challenge History Section */}
      {/* <Divider sx={{ my: 4 }} />

      <Box>
        <Typography variant="h5" gutterBottom sx={{ color: CHALLENGES_ACCENT_COLOR }}>Challenge History</Typography>
        {isLoadingHistory && <CircularProgress sx={{ color: CHALLENGES_ACCENT_COLOR }} />}
        {historyError && challengeHistory.length === 0 && <Alert severity="error">{historyError}</Alert>} 
        {!isLoadingHistory && challengeHistory.length === 0 && !historyError && (
          <Typography color="text.secondary">No past challenges found.</Typography>
        )}
        {challengeHistory.map(challenge => renderChallengeItem(challenge, 'history'))}
      </Box> */}

      {currentUser && quizDataForChallenge && (
        <ChallengeSetupModal
            open={challengeSetupModalOpen}
            onClose={() => setChallengeSetupModalOpen(false)}
            currentUser={currentUser}
            quizDataForChallenge={quizDataForChallenge}
            accentColor={themeSubjectAccentColors[quizDataForChallenge.subject?.toLowerCase()] || CHALLENGES_ACCENT_COLOR}
        />
      )}
    </Box>
  );
}

export default ChallengesPage;