// src/pages/ChallengesPage.js
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, Divider, useTheme, darken, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';

import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext'; // IMPORT useAuth
import { subjectAccentColors as themeSubjectAccentColors } from '../theme'; // Corrected import
import ChallengeSetupModal from '../components/challenges/ChallengeSetupModal';
import RecentAttemptsForChallenge from '../components/challenges/RecentAttemptsForChallenge';
import IncomingChallengesList from '../components/challenges/IncomingChallengesList';


function ChallengesPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser, isLoadingAuth } = useAuth(); // <-- CALL useAuth() ONCE AT THE TOP
  const CHALLENGES_ACCENT_COLOR = theme.palette.challengesAccent?.main || theme.palette.secondary.main;

  const [recentResults, setRecentResults] = useState([]);
  const [isLoadingRecentResults, setIsLoadingRecentResults] = useState(false);
  const [recentResultsError, setRecentResultsError] = useState('');
  // const [showAllRecentResults, setShowAllRecentResults] = useState(false); // This was defined but not used in the return JSX, assuming it's for RecentAttemptsForChallenge internal logic
  // const MAX_INITIAL_RECENT_RESULTS = 3; // This was defined but not used in the return JSX

  const [pendingReceivedChallenges, setPendingReceivedChallenges] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [pendingError, setPendingError] = useState('');

  const [challengeSetupModalOpen, setChallengeSetupModalOpen] = useState(false);
  const [quizDataForChallenge, setQuizDataForChallenge] = useState(null);

  const fetchRecentResults = useCallback(async () => {
    if (!currentUser?.id || !currentUser?.token) {
        setRecentResults([]); return;
    }
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


  const fetchPendingChallengeData = useCallback(async () => {
    if (!currentUser?.token) {
        setPendingReceivedChallenges([]); return;
    }
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
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
        fetchRecentResults();
        fetchPendingChallengeData();
    } else {
        setRecentResults([]);
        setPendingReceivedChallenges([]);
        setRecentResultsError('');
        setPendingError('');
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
        topicName: result.topicName,
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

  // Conditional rendering based on isLoadingAuth and currentUser
  if (isLoadingAuth) { // Check if still loading initial auth state
    return (
         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
            <CircularProgress sx={{ color: CHALLENGES_ACCENT_COLOR }} />
            <Typography sx={{ml:2}}>Loading Challenges...</Typography>
        </Box>
    );
  }

  if (!currentUser) { // If not loading and no user, prompt login
    return (
      <Box sx={{ p: 3, textAlign: 'center', maxWidth: '600px', margin: 'auto', mt: 4 }}>
        <Paper elevation={3} sx={{p:3, borderTop: `4px solid ${CHALLENGES_ACCENT_COLOR}`}}>
            <Typography variant="h6">Please log in to view and manage challenges.</Typography>
            <Button variant="contained" onClick={() => navigate('/account')} sx={{mt: 2, backgroundColor: CHALLENGES_ACCENT_COLOR, '&:hover': { backgroundColor: darken(CHALLENGES_ACCENT_COLOR, 0.2)}}}>Go to Login</Button>
        </Paper>
      </Box>
    );
  }

  // If loading finished and currentUser exists, render the page content
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: CHALLENGES_ACCENT_COLOR, fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
        <SportsKabaddiIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.3em', color: CHALLENGES_ACCENT_COLOR }} />
        My Challenges
      </Typography>

      <RecentAttemptsForChallenge
        results={recentResults}
        isLoading={isLoadingRecentResults}
        error={recentResultsError}
        onInitiateChallenge={handleOpenChallengeSetupFromRecent}
        accentColor={CHALLENGES_ACCENT_COLOR}
      />

      <Divider sx={{ my: 4 }} />

      <IncomingChallengesList
        challenges={pendingReceivedChallenges}
        isLoading={isLoadingPending}
        error={pendingError}
        onPlayChallenge={handleStartChallenge}
        currentUserId={currentUser?.id}
        accentColor={CHALLENGES_ACCENT_COLOR}
      />

      {/* ChallengeSetupModal uses currentUser from context internally if updated, or receives it as a prop */}
      {quizDataForChallenge && ( // currentUser check is implicitly handled by modal or its trigger
        <ChallengeSetupModal
            open={challengeSetupModalOpen}
            onClose={() => setChallengeSetupModalOpen(false)}
            quizDataForChallenge={quizDataForChallenge}
            accentColor={themeSubjectAccentColors[quizDataForChallenge.subject?.toLowerCase()] || CHALLENGES_ACCENT_COLOR}
        />
      )}
    </Box>
  );
}

export default ChallengesPage;