// src/pages/ResultsPage.js
import { Box, Button, Typography, useTheme, darken, CircularProgress, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HistoryIcon from '@mui/icons-material/History';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../contexts/AuthContext';
import { useResults } from '../hooks/useResults'; // <-- Import the new hook

// Import result-specific components
import CurrentResultView from '../components/results/CurrentResultView';
import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoricalResultDetailView from '../components/results/HistoricalResultDetailView';
import ResultRevealOverlay from '../components/results/ResultRevealOverlay';
import ResultsActionButtons from '../components/results/ResultsActionButtons';

// Shared and other components
import DeleteConfirmationDialog from '../components/shared/DeleteConfirmationDialog';
import ChallengeSetupModal from '../components/challenges/ChallengeSetupModal';
import { subjectAccentColors } from '../theme';

function ResultsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isLoadingAuth } = useAuth(); // Only need loading state here

  const {
    currentUser,
    currentQuizDataFromState,
    showRevealAnimation,
    isShowingCurrentQuizResult,
    selectedHistoricalResult,
    historicalResults,
    isLoadingHistoricalList,
    fetchListError,
    processedHistoricalDetailedView,
    isLoadingHistoricalDetails,
    detailsFetchError,
    deleteConfirmationOpen,
    deleteError,
    challengeSetupModalOpen,
    quizDataForChallenge,
    handleAnimationComplete,
    handleViewHistoricalResultDetail,
    handleBackToList,
    handleNavigateHome,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
    handleOpenChallengeSetup,
    handleCloseChallengeSetupModal
  } = useResults();
  
  const RESULTS_PAGE_ACCENT_COLOR = theme.palette.resultsAccent?.main || theme.palette.info.main;

  // --- Render Logic ---

  if (isLoadingAuth) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 128px)">
        <CircularProgress sx={{ color: RESULTS_PAGE_ACCENT_COLOR }} />
      </Box>
    );
  }

  if (showRevealAnimation && isShowingCurrentQuizResult) {
    return <ResultRevealOverlay onAnimationComplete={handleAnimationComplete} />;
  }

  const renderContent = () => {
    if (selectedHistoricalResult) {
      return (
        <HistoricalResultDetailView
          selectedResult={selectedHistoricalResult}
          detailedQuestions={processedHistoricalDetailedView}
          isLoadingDetails={isLoadingHistoricalDetails}
          detailsError={detailsFetchError}
          onBackToList={handleBackToList}
          onNavigateHome={handleNavigateHome}
          onOpenDeleteDialog={openDeleteConfirmation}
          onOpenChallengeSetup={() => handleOpenChallengeSetup(selectedHistoricalResult)}
          currentUser={currentUser}
          accentColor={RESULTS_PAGE_ACCENT_COLOR}
        />
      );
    }
    
    if (isShowingCurrentQuizResult) {
      return (
        <CurrentResultView
          currentQuizDataFromState={currentQuizDataFromState}
          onViewHistory={handleBackToList} // Navigates to list view
          onNavigateHome={handleNavigateHome}
          onOpenChallengeSetup={() => handleOpenChallengeSetup(currentQuizDataFromState)}
          currentUser={currentUser}
        />
      );
    }

    // Default view: Historical results list or login prompt
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
            results={historicalResults}
            isLoading={isLoadingHistoricalList}
            error={fetchListError}
            deleteError={deleteError && !deleteConfirmationOpen ? deleteError : ''}
            onResultClick={handleViewHistoricalResultDetail}
            onDeleteClick={openDeleteConfirmation}
            currentUser={currentUser}
            accentColor={RESULTS_PAGE_ACCENT_COLOR}
          />
        )}
        <ResultsActionButtons
          onNavigateHome={handleNavigateHome}
          showBackToListButton={false}
          showViewHistoryButton={false}
          accentColor={RESULTS_PAGE_ACCENT_COLOR}
        />
      </>
    );
  };

  return (
    <>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth:'900px', margin: 'auto', mt: 2 }}>
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