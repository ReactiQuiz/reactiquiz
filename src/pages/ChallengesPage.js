// src/pages/ChallengesPage.js
import { Box, Typography, Paper, Button, Divider, useTheme, darken, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';

import { useAuth } from '../contexts/AuthContext';
import { useChallenges } from '../hooks/useChallenges'; // <-- Import the new hook
import { subjectAccentColors as themeSubjectAccentColors } from '../theme';
import ChallengeSetupModal from '../components/challenges/ChallengeSetupModal';
import RecentAttemptsForChallenge from '../components/challenges/RecentAttemptsForChallenge';
import IncomingChallengesList from '../components/challenges/IncomingChallengesList';

function ChallengesPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser, isLoadingAuth } = useAuth();
  const CHALLENGES_ACCENT_COLOR = theme.palette.challengesAccent?.main || theme.palette.secondary.main;

  // Use the custom hook to get all state and logic
  const {
    recentResults,
    isLoadingRecentResults,
    recentResultsError,
    pendingReceivedChallenges,
    isLoadingPending,
    pendingError,
    challengeSetupModalOpen,
    quizDataForChallenge,
    handleOpenChallengeSetupFromRecent,
    handleCloseChallengeSetupModal,
    handleStartChallenge
  } = useChallenges(currentUser);

  // --- Render Logic ---

  if (isLoadingAuth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress sx={{ color: CHALLENGES_ACCENT_COLOR }} />
        <Typography sx={{ ml: 2 }}>Loading Challenges...</Typography>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', maxWidth: '600px', margin: 'auto', mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderTop: `4px solid ${CHALLENGES_ACCENT_COLOR}` }}>
          <Typography variant="h6">Please log in to view and manage challenges.</Typography>
          <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 2, backgroundColor: CHALLENGES_ACCENT_COLOR, '&:hover': { backgroundColor: darken(CHALLENGES_ACCENT_COLOR, 0.2) } }}>Go to Login</Button>
        </Paper>
      </Box>
    );
  }

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

      {quizDataForChallenge && (
        <ChallengeSetupModal
          open={challengeSetupModalOpen}
          onClose={handleCloseChallengeSetupModal}
          currentUser={currentUser} // Pass currentUser to modal if it needs it directly
          quizDataForChallenge={quizDataForChallenge}
          accentColor={themeSubjectAccentColors[quizDataForChallenge.subject?.toLowerCase()] || CHALLENGES_ACCENT_COLOR}
        />
      )}
    </Box>
  );
}

export default ChallengesPage;