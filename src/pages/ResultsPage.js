// src/pages/ResultsPage.js
import {
  useMemo, useEffect, useState, useCallback
} from 'react';
import {
  useLocation, useNavigate
} from 'react-router-dom';
import {
  Box, Typography, darken, Paper, Divider, Alert, CircularProgress, Button, useTheme, alpha, Grid, Stack
} from '@mui/material';
import apiClient from '../api/axiosInstance';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import LoginIcon from '@mui/icons-material/Login';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi'; // Re-added for challenge icon

import { subjectAccentColors } from '../theme';
import QuizResultSummary from '../components/QuizResultSummary';
import QuestionBreakdown from '../components/QuestionBreakdown';
import HistoricalResultItem from '../components/HistoricalResultItem';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import ResultsActionButtons from '../components/ResultsActionButtons';
import ResultRevealOverlay from '../components/ResultRevealOverlay';
import ChallengeSetupModal from '../components/ChallengeSetupModal'; // Re-added
import { formatTime } from '../utils/formatTime';

const formatTopicNameFromResult = (topicId, topicNameFromState = null, isChallenge = false, challengeDetails = null) => {
  if (isChallenge && challengeDetails?.topic_name) return `Challenge: ${challengeDetails.topic_name}`;
  if (isChallenge) return `Challenge: ${topicId ? String(topicId).replace(/-/g, ' ') : 'Quiz'}`;

  if (topicNameFromState && topicNameFromState !== topicId?.replace(/-/g, ' ')) return topicNameFromState;
  if (!topicId) return 'N/A';
  let name = String(topicId).replace(/-/g, ' ');

  name = name.replace(/^homibhabha practice /i, 'Homi Bhabha Practice - ');
  name = name.replace(/^pyq /i, 'PYQ ');

  const classSuffixRegex = /\s(\d+(?:st|nd|rd|th))$/i;
  name = name.replace(classSuffixRegex, (match, p1) => ` - Class ${p1.toUpperCase()}`).trim();

  name = name.split(' ').map(word => {
    if (word.toLowerCase() === 'class' || word.toLowerCase() === 'std') return word;
    if (word.includes('-')) {
      return word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-');
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');

  name = name.replace(/Homi Bhabha Practice - (\w+) (\w+)/i, (match, quizClass, difficulty) =>
    `Homi Bhabha Practice - Std ${quizClass} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`
  );
  name = name.replace(/Pyq (\w+) (\d+)/i, (match, quizClass, year) =>
    `PYQ - Std ${quizClass} (${year})`
  );

  return name;
};


function ResultsPage({ currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const currentQuizDataFromState = location.state;
  const RESULTS_PAGE_ACCENT_COLOR = theme.palette.resultsAccent?.main || theme.palette.info.main;

  const [showRevealAnimation, setShowRevealAnimation] = useState(
    currentQuizDataFromState?.isFirstResultView === true
  );

  const [historicalResults, setHistoricalResults] = useState([]);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [detailsFetchError, setDetailsFetchError] = useState('');

  const [selectedHistoricalResult, setSelectedHistoricalResult] = useState(null);
  const [processedHistoricalDetailedView, setProcessedHistoricalDetailedView] = useState([]);
  const [isLoadingHistoricalDetails, setIsLoadingHistoricalDetails] = useState(false);

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [resultToDeleteId, setResultToDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const [challengeSetupModalOpen, setChallengeSetupModalOpen] = useState(false);
  const [quizDataForChallenge, setQuizDataForChallenge] = useState(null);


  const {
    quizAttemptId: currentQuizAttemptId,
    subject: currentSubject,
    topicId: currentTopicIdFromState,
    difficulty: currentDifficulty,
    numQuestionsConfigured: currentNumQuestionsConfigured,
    quizClass: currentQuizClass,
    timeTaken: currentTimeTaken,
    originalQuestionsForDisplay,
    originalAnswersForDisplay,
    subjectAccentColor: currentSubjectAccentColor,
    score: currentScoreFromState,
    percentage: currentPercentageFromState,
    savedToHistory,
    isChallenge: currentQuizIsChallenge,
    challengeDetails: currentQuizChallengeDetails
  } = useMemo(() => {
    return currentQuizDataFromState || {};
  }, [currentQuizDataFromState]);

  const { score, percentage, detailedResultsForCurrentQuiz } = useMemo(() => {
    if (originalQuestionsForDisplay && Array.isArray(originalQuestionsForDisplay) && originalQuestionsForDisplay.length > 0) {
      if (currentScoreFromState !== undefined && currentPercentageFromState !== undefined) {
        const results = originalQuestionsForDisplay.map(question => {
          const userAnswerId = originalAnswersForDisplay ? originalAnswersForDisplay[question.id] : null;
          const isCorrect = userAnswerId === question.correctOptionId;
          return { ...question, userAnswerId, isCorrect, isAnswered: userAnswerId !== undefined && userAnswerId !== null };
        });
        return { score: currentScoreFromState, percentage: currentPercentageFromState, detailedResultsForCurrentQuiz: results };
      }
    }
    return { score: 0, percentage: 0, detailedResultsForCurrentQuiz: [] };
  }, [originalQuestionsForDisplay, originalAnswersForDisplay, currentScoreFromState, currentPercentageFromState]);

  const isShowingCurrentQuizResult = !!(originalQuestionsForDisplay && Array.isArray(originalQuestionsForDisplay) && originalQuestionsForDisplay.length > 0 && currentQuizAttemptId);

  const handleAnimationComplete = () => {
    setShowRevealAnimation(false);
    if (currentQuizDataFromState && currentQuizDataFromState.isFirstResultView) {
      navigate(location.pathname, {
        state: { ...currentQuizDataFromState, isFirstResultView: false },
        replace: true
      });
    }
  };

  const fetchHistoricalData = useCallback(() => {
    if (!currentUser?.id || !currentUser?.token) {
      setHistoricalResults([]);
      setIsLoadingHistorical(false);
      setFetchError('');
      return;
    }
    setIsLoadingHistorical(true);
    setFetchError('');

    // Fetch all results, including challenges, for the main results page
    apiClient.get(`/api/results?userId=${currentUser.id}`, {
      headers: { Authorization: `Bearer ${currentUser.token}` }
    })
      .then(response => {
        if (Array.isArray(response.data)) {
          setHistoricalResults(response.data);
        } else {
          setHistoricalResults([]);
          setFetchError('Received invalid data format for your past results.');
        }
      })
      .catch(error => {
        setFetchError(`Failed to load your past results: ${error.response?.data?.message || error.message}`);
        setHistoricalResults([]);
      })
      .finally(() => setIsLoadingHistorical(false));
  }, [currentUser]);

  useEffect(() => {
    if (selectedHistoricalResult?.questionsActuallyAttemptedIds && selectedHistoricalResult?.userAnswersSnapshot) {
      setIsLoadingHistoricalDetails(true);
      setDetailsFetchError('');
      const topicIdToFetch = selectedHistoricalResult.topicId;

      let headers = {};
      if (currentUser?.token) headers.Authorization = `Bearer ${currentUser.token}`;

      apiClient.get(`/api/questions/${topicIdToFetch}`, { headers })
        .then(response => {
          const allTopicQuestions = response.data;
          if (!Array.isArray(allTopicQuestions)) {
            setDetailsFetchError("Could not load question details: Invalid data format.");
            setProcessedHistoricalDetailedView([]);
            return;
          }
          const populatedQuestions = selectedHistoricalResult.questionsActuallyAttemptedIds.map(qId => {
            const fullQuestionData = allTopicQuestions.find(q => q.id === qId);
            if (!fullQuestionData) {
              return { id: qId, text: `Question data (ID: ${qId}) not found.`, options: [], isCorrect: false, isAnswered: selectedHistoricalResult.userAnswersSnapshot[qId] != null, userAnswerId: selectedHistoricalResult.userAnswersSnapshot[qId], explanation: "Original question data missing." };
            }
            const userAnswerId = selectedHistoricalResult.userAnswersSnapshot[qId];
            return { ...fullQuestionData, userAnswerId, isCorrect: userAnswerId === fullQuestionData.correctOptionId, isAnswered: userAnswerId != null };
          });
          setProcessedHistoricalDetailedView(populatedQuestions);
        })
        .catch(err => setDetailsFetchError(`Failed to load question details: ${err.response?.data?.message || err.message}`))
        .finally(() => setIsLoadingHistoricalDetails(false));
    } else {
      setProcessedHistoricalDetailedView([]);
      if (selectedHistoricalResult) setDetailsFetchError("No question data to display details for this result.");
    }
  }, [selectedHistoricalResult, currentUser]);


  useEffect(() => {
    if (!isShowingCurrentQuizResult && !selectedHistoricalResult && !showRevealAnimation) {
      if (currentUser?.id) fetchHistoricalData();
      else { setHistoricalResults([]); setIsLoadingHistorical(false); }
    }
  }, [isShowingCurrentQuizResult, selectedHistoricalResult, currentUser, fetchHistoricalData, showRevealAnimation]);

  const handleHistoricalResultClick = (result) => {
    setShowRevealAnimation(false);
    setDetailsFetchError('');
    setSelectedHistoricalResult(result);
  };

  const handleBackToList = () => {
    setSelectedHistoricalResult(null);
    setProcessedHistoricalDetailedView([]);
    setDetailsFetchError('');
    if (currentUser?.id) fetchHistoricalData();
  }

  const openDeleteConfirmation = (id) => {
    setResultToDeleteId(id);
    setDeleteConfirmationOpen(true);
    setDeleteError('');
  };
  const handleConfirmDelete = async () => {
    if (!resultToDeleteId || !currentUser?.token) {
      setDeleteError("Cannot delete: Missing data.");
      return;
    }
    try {
      await apiClient.delete(`/api/results/${resultToDeleteId}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      setDeleteConfirmationOpen(false);
      setResultToDeleteId(null);
      setDeleteError('');
      if (selectedHistoricalResult?.id === resultToDeleteId) handleBackToList();
      else fetchHistoricalData();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete result.");
    }
  };
  const handleNavigateHome = () => navigate('/');
  const handleNavigateToAccount = () => navigate('/account');

  const handleOpenChallengeSetup = (sourceResult) => {
    if (!currentUser) {
      navigate('/account', { state: { from: location.pathname, message: "Please login to challenge a friend." } });
      return;
    }
    let dataForChallenge;
    if (sourceResult === 'current' && isShowingCurrentQuizResult) {
      if (!originalQuestionsForDisplay || originalQuestionsForDisplay.length === 0) {
        alert("Cannot challenge: Current quiz has no questions.");
        return;
      }
      dataForChallenge = {
        topicId: currentTopicIdFromState,
        topicName: formatTopicNameFromResult(currentTopicIdFromState, (currentQuizDataFromState?.topicName || currentTopicIdFromState?.replace(/-/g, ' ')), currentQuizIsChallenge, currentQuizChallengeDetails),
        difficulty: currentDifficulty,
        numQuestions: originalQuestionsForDisplay.length,
        quizClass: currentQuizClass,
        questionIds: originalQuestionsForDisplay.map(q => q.id),
        subject: currentSubject
      };
    } else if (sourceResult && sourceResult.id) {
      if (!sourceResult.questionsActuallyAttemptedIds || sourceResult.questionsActuallyAttemptedIds.length === 0) {
        alert("Cannot challenge with this historical result as question details are missing.");
        return;
      }
      dataForChallenge = {
        topicId: sourceResult.topicId,
        topicName: formatTopicNameFromResult(sourceResult.topicId, sourceResult.topicName, !!sourceResult.challenge_id, null), // Pass null for challengeDetails if just historical
        difficulty: sourceResult.difficulty,
        numQuestions: sourceResult.questionsActuallyAttemptedIds.length,
        quizClass: sourceResult.class,
        questionIds: sourceResult.questionsActuallyAttemptedIds,
        subject: sourceResult.subject
      };
    } else {
      console.error("Invalid sourceResult for challenge setup", sourceResult);
      alert("Could not determine quiz data for challenge.");
      return;
    }

    if (!dataForChallenge.questionIds || dataForChallenge.questionIds.length === 0) {
      alert("Cannot initiate challenge: No questions found in the selected result.");
      return;
    }

    setQuizDataForChallenge(dataForChallenge);
    setChallengeSetupModalOpen(true);
  };


  // ---- Main Render Logic ----
  if (showRevealAnimation && isShowingCurrentQuizResult) {
    return <ResultRevealOverlay onAnimationComplete={handleAnimationComplete} />;
  }

  if (selectedHistoricalResult) {
    const accent = subjectAccentColors[selectedHistoricalResult.subject?.toLowerCase()] || RESULTS_PAGE_ACCENT_COLOR;
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
        <QuizResultSummary
          quizResult={selectedHistoricalResult}
          quizTitle={selectedHistoricalResult.challenge_id ? "Past Challenge Details" : "Past Quiz Details"}
          accentColor={accent}
          isChallenge={!!selectedHistoricalResult.challenge_id}
        />
        {isLoadingHistoricalDetails ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="20vh" sx={{ my: 2 }}>
            <CircularProgress sx={{ color: accent }} /> <Typography sx={{ ml: 2 }}>Loading question details...</Typography>
          </Box>
        ) : detailsFetchError ? (
          <Alert severity="error" sx={{ mt: 2 }}>{detailsFetchError}</Alert>
        ) : processedHistoricalDetailedView.length > 0 ? (
          <QuestionBreakdown detailedQuestionsToDisplay={processedHistoricalDetailedView} />
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>No detailed question breakdown available or no questions were attempted for this result.</Alert>
        )}
        <ResultsActionButtons
          onBackToList={handleBackToList}
          onNavigateHome={handleNavigateHome}
          showBackToListButton={true}
          accentColor={accent}
          showDeleteButton={currentUser && currentUser.id === selectedHistoricalResult.userId}
          onDeleteClick={() => openDeleteConfirmation(selectedHistoricalResult.id)}
          deleteDisabled={!selectedHistoricalResult.id || !(currentUser && currentUser.id === selectedHistoricalResult.userId)}
          onChallengeFriend={() => handleOpenChallengeSetup(selectedHistoricalResult)}
          showChallengeButton={currentUser && !!selectedHistoricalResult.questionsActuallyAttemptedIds && selectedHistoricalResult.questionsActuallyAttemptedIds.length > 0 && !selectedHistoricalResult.challenge_id}
          currentUser={currentUser}
        />
        <DeleteConfirmationDialog
          open={deleteConfirmationOpen}
          onClose={() => { setDeleteConfirmationOpen(false); setDeleteError(''); }}
          onConfirm={handleConfirmDelete}
          error={deleteError}
          title="Confirm Deletion"
          message={`Are you sure you want to delete this quiz result? This action cannot be undone.`}
        />
      </Box>
    );
  }

  if (isShowingCurrentQuizResult && !showRevealAnimation) {
    const currentQuizResultForView = {
      subject: currentSubject,
      topicId: currentTopicIdFromState,
      topicName: formatTopicNameFromResult(currentTopicIdFromState, (currentQuizDataFromState?.topicName || currentTopicIdFromState?.replace(/-/g, ' ')), currentQuizIsChallenge, currentQuizChallengeDetails),
      score: score,
      totalQuestions: originalQuestionsForDisplay ? originalQuestionsForDisplay.length : 0,
      percentage: percentage,
      difficulty: currentDifficulty,
      numQuestionsConfigured: currentNumQuestionsConfigured,
      class: currentQuizClass,
      timeTaken: currentTimeTaken,
      challenge_id: currentQuizIsChallenge ? currentQuizChallengeDetails?.id : null // Pass challenge_id for summary
    };
    const accent = currentSubjectAccentColor || RESULTS_PAGE_ACCENT_COLOR;
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
        <QuizResultSummary
          quizResult={currentQuizResultForView}
          quizTitle={currentQuizIsChallenge ? "Challenge Results" : "Quiz Results"}
          accentColor={accent}
          isChallenge={currentQuizIsChallenge}
        />
        {savedToHistory === false && !currentUser && (<Alert severity="info" sx={{ my: 2 }}>This result was not saved. Please <Button size="small" onClick={handleNavigateToAccount}>Login/Register</Button> to save future results.</Alert>)}
        {savedToHistory === false && currentUser && (<Alert severity="warning" sx={{ my: 2 }}>There was an issue saving this result to your history. It is displayed for this session only.</Alert>)}
        {savedToHistory === true && (<Alert severity="success" sx={{ my: 2 }}>This result has been saved to your history.</Alert>)}

        {currentQuizIsChallenge && currentQuizChallengeDetails && (
          <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: alpha(theme.palette.info.dark, 0.1) }}>
            <Typography variant="h6" gutterBottom>Challenge Details</Typography>
            <Divider sx={{ mb: 1 }} />
            <Stack spacing={0.5}>
              <Typography>
                <strong>{currentUser?.id === currentQuizChallengeDetails.challenger_id ? 'You Challenged:' : 'Challenged by:'}</strong>{' '}
                {currentUser?.id === currentQuizChallengeDetails.challenger_id ? currentQuizChallengeDetails.challengedUsername : currentQuizChallengeDetails.challengerUsername}
              </Typography>
              <Typography>
                <strong>Topic:</strong> {formatTopicNameFromResult(currentQuizChallengeDetails.topic_id, currentQuizChallengeDetails.topic_name, true, currentQuizChallengeDetails)}
              </Typography>
              <Typography>
                <strong>Your Score:</strong> {score}/{originalQuestionsForDisplay?.length}
                {currentTimeTaken != null && ` (${formatTime(currentTimeTaken)})`}
              </Typography>

              {currentQuizChallengeDetails.challenger_id === currentUser?.id && currentQuizChallengeDetails.challenged_score !== null && (
                <Typography>
                  <strong>{currentQuizChallengeDetails.challengedUsername}'s Score:</strong> {currentQuizChallengeDetails.challenged_score}/{currentQuizChallengeDetails.num_questions}
                  {currentQuizChallengeDetails.challenged_time_taken != null && ` (${formatTime(currentQuizChallengeDetails.challenged_time_taken)})`}
                </Typography>
              )}
              {currentQuizChallengeDetails.challenged_id === currentUser?.id && currentQuizChallengeDetails.challenger_score !== null && (
                <Typography>
                  <strong>{currentQuizChallengeDetails.challengerUsername}'s Score:</strong> {currentQuizChallengeDetails.challenger_score}/{currentQuizChallengeDetails.num_questions}
                  {currentQuizChallengeDetails.challenger_time_taken != null && ` (${formatTime(currentQuizChallengeDetails.challenger_time_taken)})`}
                </Typography>
              )}

              {currentQuizChallengeDetails.status === 'completed' && (
                <Typography sx={{
                  fontWeight: 'bold', mt: 1, color:
                    currentQuizChallengeDetails.winner_id === null ? theme.palette.info.main :
                      (currentQuizChallengeDetails.winner_id === currentUser?.id ? theme.palette.success.main : theme.palette.error.main)
                }}>
                  {currentQuizChallengeDetails.winner_id === null ? "It's a Tie!" :
                    (currentQuizChallengeDetails.winner_id === currentUser?.id ? "🎉 You Won!" :
                      `${currentQuizChallengeDetails.winnerUsername || 'Opponent'} Won.`)}
                </Typography>
              )}
              {currentQuizChallengeDetails.status === 'challenger_completed' && currentQuizChallengeDetails.challenger_id === currentUser?.id && (
                <Typography sx={{ fontStyle: 'italic', color: theme.palette.text.secondary, mt: 1 }}>
                  Waiting for {currentQuizChallengeDetails.challengedUsername} to play.
                </Typography>
              )}
            </Stack>
          </Paper>
        )}

        {detailedResultsForCurrentQuiz && detailedResultsForCurrentQuiz.length > 0 &&
          <QuestionBreakdown detailedQuestionsToDisplay={detailedResultsForCurrentQuiz} />
        }
        <ResultsActionButtons
          onNavigateHome={handleNavigateHome}
          onViewHistory={() => {
            navigate('/results', { replace: true, state: null });
            setSelectedHistoricalResult(null);
            setShowRevealAnimation(false);
            if (currentUser?.id) fetchHistoricalData();
          }}
          showBackToListButton={false}
          showViewHistoryButton={true}
          accentColor={accent}
          onChallengeFriend={() => handleOpenChallengeSetup('current')}
          showChallengeButton={currentUser && !currentQuizIsChallenge && originalQuestionsForDisplay && originalQuestionsForDisplay.length > 0}
          currentUser={currentUser}
        />
      </Box>
    );
  }

  // Default view: Historical results list or login prompt
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth:'100%', width:'10000px', margin: 'auto', mt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, textAlign: 'center', color: RESULTS_PAGE_ACCENT_COLOR, fontWeight: 'bold' }}>
        <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.3em', color: RESULTS_PAGE_ACCENT_COLOR }} />
        {currentUser ? `${currentUser.name}'s Quiz Results` : 'Past Quiz Results'}
      </Typography>

      {fetchError && !currentUser && <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>Could not load general history. {fetchError}</Alert>}
      {fetchError && currentUser && <Alert severity="error" variant="filled" sx={{ mb: 2 }}>{fetchError}</Alert>}
      {deleteError && !deleteConfirmationOpen && <Alert severity="error" variant="filled" sx={{ mb: 2 }}>{deleteError}</Alert>}

      {!currentUser ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mt: 3, borderTop: `5px solid ${RESULTS_PAGE_ACCENT_COLOR}` }}>
          <Typography variant="h6" gutterBottom>Access Your Quiz History</Typography>
          <Typography sx={{ mb: 2 }}>Please log in to view your saved quiz results.</Typography>
          <Button variant="contained" startIcon={<LoginIcon />} onClick={handleNavigateToAccount} sx={{ backgroundColor: RESULTS_PAGE_ACCENT_COLOR, '&:hover': { backgroundColor: darken(RESULTS_PAGE_ACCENT_COLOR, 0.2) } }} >
            Login / Register
          </Button>
        </Paper>
      ) : isLoadingHistorical ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress sx={{ color: RESULTS_PAGE_ACCENT_COLOR }} /> <Typography sx={{ ml: 2 }}>Loading your results...</Typography>
        </Box>
      ) : historicalResults.length === 0 && !fetchError ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderTop: `5px solid ${RESULTS_PAGE_ACCENT_COLOR}` }}>
          <Typography variant="h6" gutterBottom>No Saved Results Found</Typography>
          <Typography>You haven't completed and saved any quizzes yet under this account.</Typography>
          <Button variant="contained" startIcon={<HomeIcon />} onClick={handleNavigateHome} sx={{ mt: 2, backgroundColor: RESULTS_PAGE_ACCENT_COLOR, '&:hover': { backgroundColor: darken(RESULTS_PAGE_ACCENT_COLOR, 0.2) } }} >
            Go to Home & Take a Quiz
          </Button>
        </Paper>
      ) : (
        <Box sx={{ mt: 2}}>
          {Array.isArray(historicalResults) && historicalResults.map((result) => (
            <HistoricalResultItem
              key={result.id}
              result={result}
              onResultClick={handleHistoricalResultClick}
              onDeleteClick={openDeleteConfirmation}
              showDeleteButton={currentUser && currentUser.id === result.userId}
              isChallengeResult={!!result.challenge_id}
            />
          ))}
        </Box>
      )}
      {!selectedHistoricalResult && (
        <ResultsActionButtons
          onNavigateHome={handleNavigateHome}
          showBackToListButton={false}
          showViewHistoryButton={isShowingCurrentQuizResult}
          accentColor={RESULTS_PAGE_ACCENT_COLOR}
          onViewHistory={() => {
            navigate('/results', { replace: true, state: null });
            setSelectedHistoricalResult(null);
            setShowRevealAnimation(false);
            if (currentUser?.id) fetchHistoricalData();
          }}
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
          currentUser={currentUser}
          quizDataForChallenge={quizDataForChallenge}
          accentColor={subjectAccentColors[quizDataForChallenge.subject?.toLowerCase()] || theme.palette.secondary.main}
        />
      )}
    </Box>
  );
}

export default ResultsPage;