// src/pages/ResultsPage.js
import { useMemo, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Alert, useTheme, darken, Paper
} from '@mui/material';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import HistoryIcon from '@mui/icons-material/History';
import LoginIcon from '@mui/icons-material/Login';

import { parseQuestionOptions as parseQuestionOptionsForResults, formatDisplayTopicName } from '../utils/quizUtils';

// Import result-specific components from their new location
import CurrentResultView from '../components/results/CurrentResultView';
import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoricalResultDetailView from '../components/results/HistoricalResultDetailView';
import ResultRevealOverlay from '../components/results/ResultRevealOverlay';
import ResultsActionButtons from '../components/results/ResultsActionButtons'; // For fallback actions on list view

// Shared and other components
import DeleteConfirmationDialog from '../components/shared/DeleteConfirmationDialog';
import ChallengeSetupModal from '../components/challenges/ChallengeSetupModal'; // Path might differ
import { subjectAccentColors } from '../theme'; // For ChallengeSetupModal accent

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser, isLoadingAuth } = useAuth(); // Use auth context
  const currentQuizDataFromState = location.state; // Data from QuizPage navigation
  const RESULTS_PAGE_ACCENT_COLOR = theme.palette.resultsAccent?.main || theme.palette.info.main;

  const [showRevealAnimation, setShowRevealAnimation] = useState(
    currentQuizDataFromState?.isFirstResultView === true
  );

  // State for historical results list
  const [historicalResults, setHistoricalResults] = useState([]);
  const [isLoadingHistoricalList, setIsLoadingHistoricalList] = useState(false);
  const [fetchListError, setFetchListError] = useState('');

  // State for viewing details of a selected historical result
  const [selectedHistoricalResult, setSelectedHistoricalResult] = useState(null);
  const [processedHistoricalDetailedView, setProcessedHistoricalDetailedView] = useState([]);
  const [isLoadingHistoricalDetails, setIsLoadingHistoricalDetails] = useState(false);
  const [detailsFetchError, setDetailsFetchError] = useState('');

  // State for delete confirmation
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [resultToDeleteId, setResultToDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // State for challenge setup modal
  const [challengeSetupModalOpen, setChallengeSetupModalOpen] = useState(false);
  const [quizDataForChallenge, setQuizDataForChallenge] = useState(null);

  // Determine if we are showing a result from the quiz just taken
  const isShowingCurrentQuizResult = useMemo(() =>
    !!(currentQuizDataFromState?.originalQuestionsForDisplay &&
       currentQuizDataFromState?.quizAttemptId && // Use quizAttemptId for uniqueness
       !selectedHistoricalResult),
    [currentQuizDataFromState, selectedHistoricalResult]
  );

  const handleAnimationComplete = () => {
    setShowRevealAnimation(false);
    // Update state to prevent re-animation on refresh/navigation
    if (currentQuizDataFromState && currentQuizDataFromState.isFirstResultView) {
      navigate(location.pathname, {
        state: { ...currentQuizDataFromState, isFirstResultView: false },
        replace: true
      });
    }
  };

  const fetchHistoricalData = useCallback(() => {
    if (!currentUser?.id || !currentUser?.token) {
      setHistoricalResults([]); setIsLoadingHistoricalList(false); setFetchListError(''); return;
    }
    setIsLoadingHistoricalList(true); setFetchListError('');
    apiClient.get(`/api/results?userId=${currentUser.id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } })
      .then(response => {
        if (Array.isArray(response.data)) {
          // Ensure topicName is formatted for each historical result
          const formattedResults = response.data.map(result => ({
            ...result,
            topicName: formatDisplayTopicName(result.topicId, result.topicName, !!result.challenge_id, result)
          }));
          setHistoricalResults(formattedResults);
        } else {
          setHistoricalResults([]); setFetchListError('Invalid data format for your past results.');
        }
      })
      .catch(error => {
        setFetchListError(`Failed to load your past results: ${error.response?.data?.message || error.message}`);
        setHistoricalResults([]);
      })
      .finally(() => setIsLoadingHistoricalList(false));
  }, [currentUser]);

  // Effect to fetch details when a historical result is selected
  useEffect(() => {
    if (selectedHistoricalResult?.id && selectedHistoricalResult?.questionsActuallyAttemptedIds) {
      setIsLoadingHistoricalDetails(true); setDetailsFetchError('');
      const topicIdToFetch = selectedHistoricalResult.topicId;
      let headers = {}; if (currentUser?.token) headers.Authorization = `Bearer ${currentUser.token}`;

      apiClient.get(`/api/questions?topicId=${topicIdToFetch}`, { headers }) // Fetches questions for the topic
        .then(response => {
          const allTopicQuestionsRaw = response.data;
          if (!Array.isArray(allTopicQuestionsRaw)) {
            setDetailsFetchError("Could not load question details: Invalid data format.");
            setProcessedHistoricalDetailedView([]); return;
          }
          const allTopicQuestionsParsed = parseQuestionOptionsForResults(allTopicQuestionsRaw);
          const populatedQuestions = selectedHistoricalResult.questionsActuallyAttemptedIds.map(qId => {
            const fullQuestionData = allTopicQuestionsParsed.find(q => q.id === qId);
            if (!fullQuestionData) {
              return { id: qId, text: `Question data (ID: ${qId}) not found.`, options: [], isCorrect: false, isAnswered: selectedHistoricalResult.userAnswersSnapshot[qId] != null, userAnswerId: selectedHistoricalResult.userAnswersSnapshot[qId], explanation: "Original question data missing." };
            }
            const userAnswerId = selectedHistoricalResult.userAnswersSnapshot[qId];
            return { ...fullQuestionData, userAnswerId, isCorrect: userAnswerId === fullQuestionData.correctOptionId, isAnswered: userAnswerId != null };
          });
          setProcessedHistoricalDetailedView(populatedQuestions);
        })
        .catch(err => setDetailsFetchError(`Failed to load question details for history: ${err.response?.data?.message || err.message}`))
        .finally(() => setIsLoadingHistoricalDetails(false));
    } else {
      setProcessedHistoricalDetailedView([]); // Clear if no result selected or no question IDs
      // if (selectedHistoricalResult) setDetailsFetchError("No question IDs found for this historical result to fetch details.");
    }
  }, [selectedHistoricalResult, currentUser]);

  // Effect for initial load or when returning to list view
  useEffect(() => {
    if (!isShowingCurrentQuizResult && !selectedHistoricalResult && !showRevealAnimation && !isLoadingAuth) {
      if (currentUser?.id) {
        fetchHistoricalData();
      } else {
        setHistoricalResults([]);
        setIsLoadingHistoricalList(false);
        setFetchListError(''); // Clear error if user logs out
      }
    }
  }, [isShowingCurrentQuizResult, selectedHistoricalResult, currentUser, fetchHistoricalData, showRevealAnimation, isLoadingAuth]);

  const handleViewHistoricalResultDetail = (result) => {
    setShowRevealAnimation(false); // Ensure animation doesn't play when viewing history
    setDetailsFetchError('');
    // The result from historicalResults should already have a formatted topicName
    setSelectedHistoricalResult(result);
  };

  const handleBackToList = () => {
    setSelectedHistoricalResult(null);
    setProcessedHistoricalDetailedView([]);
    setDetailsFetchError('');
    // Optionally re-fetch historical data if needed, or assume it's current
    if (currentUser?.id) fetchHistoricalData();
  }

  const openDeleteConfirmation = (id) => { setResultToDeleteId(id); setDeleteConfirmationOpen(true); setDeleteError(''); };

  const handleConfirmDelete = async () => {
    if (!resultToDeleteId || !currentUser?.token) { setDeleteError("Cannot delete: Missing data."); return; }
    try {
      await apiClient.delete(`/api/results/${resultToDeleteId}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      setDeleteConfirmationOpen(false);
      const deletedId = resultToDeleteId; // Store before resetting
      setResultToDeleteId(null);
      setDeleteError('');
      if (selectedHistoricalResult?.id === deletedId) {
        handleBackToList(); // If deleting the currently viewed detail, go back to list
      } else {
        fetchHistoricalData(); // Otherwise, just refresh the list
      }
    } catch (err) { setDeleteError(err.response?.data?.message || "Failed to delete result."); }
  };

  const handleNavigateHome = () => navigate('/');
  const handleNavigateToAccount = () => navigate('/account');

  const handleOpenChallengeSetup = (sourceResultOrIdentifier) => {
    if (!currentUser) { navigate('/account', { state: { from: location.pathname, message: "Login to challenge." } }); return; }

    let resultDataToUse;
    let sourceQuestions;

    if (sourceResultOrIdentifier === 'current' && isShowingCurrentQuizResult && currentQuizDataFromState) {
      resultDataToUse = currentQuizDataFromState;
      sourceQuestions = resultDataToUse.originalQuestionsForDisplay;
    } else if (typeof sourceResultOrIdentifier === 'object' && sourceResultOrIdentifier !== null) {
      resultDataToUse = sourceResultOrIdentifier;
      sourceQuestions = resultDataToUse.questionsActuallyAttemptedIds; // This contains IDs
    } else {
      alert("Could not determine quiz data for challenge."); return;
    }

    const questionIds = Array.isArray(sourceQuestions) && sourceQuestions[0]?.id
        ? sourceQuestions.map(q => q.id) // If it's an array of question objects
        : sourceQuestions; // Assume it's already an array of IDs if not objects

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      alert("No questions found in the selected result to base a challenge on."); return;
    }

    setQuizDataForChallenge({
      topicId: resultDataToUse.topicId,
      topicName: formatDisplayTopicName(resultDataToUse.topicId, resultDataToUse.topicName, !!resultDataToUse.challenge_id || resultDataToUse.isChallenge, resultDataToUse.challengeDetails || resultDataToUse),
      difficulty: resultDataToUse.difficulty,
      numQuestions: questionIds.length,
      quizClass: resultDataToUse.class || resultDataToUse.quizClass, // 'class' from historical, 'quizClass' from current
      questionIds: questionIds,
      subject: resultDataToUse.subject
    });
    setChallengeSetupModalOpen(true);
  };


  // --- Render Logic ---

  if (isLoadingAuth) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 128px)">
        <CircularProgress sx={{ color: RESULTS_PAGE_ACCENT_COLOR }} />
        <Typography sx={{ ml: 2 }}>Loading Authentication...</Typography>
      </Box>
    );
  }

  if (showRevealAnimation && isShowingCurrentQuizResult) {
    return <ResultRevealOverlay onAnimationComplete={handleAnimationComplete} />;
  }

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
        onOpenChallengeSetup={handleOpenChallengeSetup}
        currentUser={currentUser}
        accentColor={RESULTS_PAGE_ACCENT_COLOR} // Pass main page accent
      />
    );
  }

  if (isShowingCurrentQuizResult && !showRevealAnimation) {
    return (
      <CurrentResultView
        currentQuizDataFromState={currentQuizDataFromState}
        onViewHistory={() => {
            navigate('/results', { replace: true, state: null }); // Clear state
            setSelectedHistoricalResult(null);
            setShowRevealAnimation(false); // Ensure this is false
            if (currentUser?.id) fetchHistoricalData();
        }}
        onNavigateHome={handleNavigateHome}
        onOpenChallengeSetup={handleOpenChallengeSetup}
        currentUser={currentUser}
      />
    );
  }

  // Default view: Historical results list or login prompt
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth:'900px', margin: 'auto', mt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 2, textAlign: 'center', color: RESULTS_PAGE_ACCENT_COLOR, fontWeight: 'bold' }}>
        <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.3em' }} />
        {currentUser ? `${currentUser.name}'s Quiz Results` : 'Past Quiz Results'}
      </Typography>

      {!currentUser ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mt: 3, borderTop: `5px solid ${RESULTS_PAGE_ACCENT_COLOR}` }}>
          <Typography variant="h6" gutterBottom>Access Your Quiz History</Typography>
          <Typography sx={{ mb: 2 }}>Please log in to view your saved quiz results.</Typography>
          <Button variant="contained" startIcon={<LoginIcon />} onClick={handleNavigateToAccount} sx={{ backgroundColor: RESULTS_PAGE_ACCENT_COLOR, '&:hover': { backgroundColor: darken(RESULTS_PAGE_ACCENT_COLOR, 0.2) } }} >
            Login / Register
          </Button>
        </Paper>
      ) : ( // currentUser exists, show list or loading/error for list
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
      {/* Fallback action buttons for the list view if it's the main view */}
      {!selectedHistoricalResult && !isShowingCurrentQuizResult && (
        <ResultsActionButtons
          onNavigateHome={handleNavigateHome}
          showBackToListButton={false} // Not applicable when already on list
          showViewHistoryButton={false} // Already viewing history
          accentColor={RESULTS_PAGE_ACCENT_COLOR}
        />
      )}

      <DeleteConfirmationDialog
        open={deleteConfirmationOpen}
        onClose={() => { setDeleteConfirmationOpen(false); setDeleteError(''); }}
        onConfirm={handleConfirmDelete}
        error={deleteError}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this quiz result? This action cannot be undone.`}
      />

      {currentUser && quizDataForChallenge && (
        <ChallengeSetupModal
          open={challengeSetupModalOpen}
          onClose={() => setChallengeSetupModalOpen(false)}
          quizDataForChallenge={quizDataForChallenge}
          accentColor={subjectAccentColors[quizDataForChallenge.subject?.toLowerCase()] || theme.palette.secondary.main}
        />
      )}
    </Box>
  );
}

export default ResultsPage;