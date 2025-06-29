// src/pages/ResultsPage.js
import { Box, Button, Typography, useTheme, darken, CircularProgress, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HistoryIcon from '@mui/icons-material/History';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../contexts/AuthContext';
import { useResults } from '../hooks/useResults';

import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoricalResultDetailView from '../components/results/HistoricalResultDetailView';
import ResultRevealOverlay from '../components/results/ResultRevealOverlay';
import DeleteConfirmationDialog from '../components/shared/DeleteConfirmationDialog';
import ChallengeSetupModal from '../components/challenges/ChallengeSetupModal';
import { subjectAccentColors } from '../theme';

function ResultsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isLoadingAuth } = useAuth();

  const {
    currentUser, view, isLoading, error, detailData, historicalList,
    showAnimation, handleAnimationComplete,
    deleteConfirmationOpen, deleteError, challengeSetupModalOpen, quizDataForChallenge,
    handleBackToList, handleNavigateHome, openDeleteConfirmation, closeDeleteConfirmation,
    handleConfirmDelete, handleOpenChallengeSetup, handleCloseChallengeSetupModal
  } = useResults();
  
  const RESULTS_PAGE_ACCENT_COLOR = theme.palette.resultsAccent?.main || theme.palette.info.main;

  const renderContent = () => {
    if (isLoadingAuth || view === 'loading') {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 200px)">
          <CircularProgress sx={{ color: RESULTS_PAGE_ACCENT_COLOR }} />
        </Box>
      );
    }
    
    if (view === 'error') {
        return (
            <Box textAlign="center" mt={4}>
                <Alert severity="error">{error || "An unknown error occurred."}</Alert>
                <Button variant="outlined" onClick={handleBackToList} sx={{mt: 2}}>Go Back to Results List</Button>
            </Box>
        );
    }

    if (view === 'detail' && detailData) {
      return (
        <HistoricalResultDetailView
          selectedResult={detailData.result}
          detailedQuestions={detailData.detailedQuestions}
          isLoadingDetails={isLoading}
          detailsError={error}
          onBackToList={handleBackToList}
          onNavigateHome={handleNavigateHome}
          onOpenDeleteDialog={openDeleteConfirmation}
          onOpenChallengeSetup={() => handleOpenChallengeSetup(detailData.result)}
          currentUser={currentUser}
          accentColor={RESULTS_PAGE_ACCENT_COLOR}
        />
      );
    }
    
    if (view === 'list') {
        return (
            <>
                <Typography variant="h4" gutterBottom sx={{ mb: 2, textAlign: 'center', color: RESULTS_PAGE_ACCENT_COLOR, fontWeight: 'bold' }}>
                    <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.3em' }} />
                    {currentUser ? `${currentUser.name}'s Quiz History` : 'Quiz History'}
                </Typography>
                {!currentUser ? (
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mt: 3, borderTop: `5px solid ${RESULTS_PAGE_ACCENT_COLOR}` }}>
                        <Typography variant="h6" gutterBottom>Access Your Quiz History</Typography>
                        <Typography sx={{ mb: 2 }}>Please log in to view your saved results.</Typography>
                        <Button variant="contained" startIcon={<LoginIcon />} onClick={() => navigate('/login')} sx={{ backgroundColor: RESULTS_PAGE_ACCENT_COLOR, '&:hover': { backgroundColor: darken(RESULTS_PAGE_ACCENT_COLOR, 0.2) } }} >
                            Login / Register
                        </Button>
                    </Paper>
                ) : (
                    <HistoricalResultsList
                        results={historicalList}
                        isLoading={isLoading}
                        error={error}
                        deleteError={deleteError}
                        onDeleteClick={openDeleteConfirmation}
                        currentUser={currentUser}
                        accentColor={RESULTS_PAGE_ACCENT_COLOR}
                    />
                )}
            </>
        );
    }

    return null;
  };

  return (
    <>
      {showAnimation && <ResultRevealOverlay onAnimationComplete={handleAnimationComplete} />}

      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth:'900px', margin: 'auto', mt: 2, visibility: showAnimation ? 'hidden' : 'visible' }}>
        {renderContent()}
      </Box>

      <DeleteConfirmationDialog
        open={deleteConfirmationOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        error={deleteError}
        title="Confirm Deletion"
        message="Are you sure you want to permanently delete this quiz result?"
      />

      {quizDataForChallenge && (
        <ChallengeSetupModal
          open={challengeSetupModalOpen}
          onClose={handleCloseChallengeSetupModal}
          currentUser={currentUser}
          quizDataForChallenge={quizDataForChallenge}
          accentColor={subjectAccentColors[quizDataForChallenge.subject?.toLowerCase()] || theme.palette.secondary.main}
        />
      )}
    </>
  );
}

export default ResultsPage;