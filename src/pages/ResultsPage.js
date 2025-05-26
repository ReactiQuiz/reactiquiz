import {
  useMemo, useEffect, useState, useCallback
} from 'react';
import {
  useLocation, useNavigate
} from 'react-router-dom';
import {
  Box, Typography, Paper, List, Alert, CircularProgress, Button, useTheme
} from '@mui/material';
import axios from 'axios';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';

import { subjectAccentColors } from '../theme';
import allChemistryQuestions from '../questions/chemistry.json';
import allPhysicsQuestions from '../questions/physics.json';
import allMathematicsQuestions from '../questions/mathematics.json';
import allBiologyQuestions from '../questions/biology.json';

import QuizResultSummary from '../components/QuizResultSummary';
import QuestionBreakdown from '../components/QuestionBreakdown';
import HistoricalResultItem from '../components/HistoricalResultItem';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import ResultsActionButtons from '../components/ResultsActionButtons';


const allQuestionsData = {
  chemistry: allChemistryQuestions,
  physics: allPhysicsQuestions,
  mathematics: allMathematicsQuestions,
  biology: allBiologyQuestions,
};

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const currentQuizDataFromState = location.state;

  const [historicalResults, setHistoricalResults] = useState([]);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [selectedHistoricalResult, setSelectedHistoricalResult] = useState(null);
  const [processedHistoricalDetailedView, setProcessedHistoricalDetailedView] = useState([]);
  const [isCurrentResultSaved, setIsCurrentResultSaved] = useState(false);

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [resultToDeleteId, setResultToDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const { score, percentage, detailedResultsForCurrentQuiz } = useMemo(() => {
    if (!currentQuizDataFromState || !currentQuizDataFromState.originalAnswersForDisplay || !currentQuizDataFromState.originalQuestionsForDisplay || !Array.isArray(currentQuizDataFromState.originalQuestionsForDisplay) || currentQuizDataFromState.originalQuestionsForDisplay.length === 0) {
      return { score: 0, percentage: 0, detailedResultsForCurrentQuiz: [] };
    }
    let calculatedScore = 0;
    const results = currentQuizDataFromState.originalQuestionsForDisplay.map(question => {
      const userAnswerId = currentQuizDataFromState.originalAnswersForDisplay[question.id];
      const correctAnswerId = question.correctOptionId;
      const isCorrect = userAnswerId === correctAnswerId;
      if (isCorrect) calculatedScore++;
      const userAnswerText = question.options.find(opt => opt.id === userAnswerId)?.text;
      const correctAnswerText = question.options.find(opt => opt.id === correctAnswerId)?.text;
      return { ...question, userAnswerId, userAnswerText, correctAnswerText, isCorrect, isAnswered: userAnswerId !== undefined && userAnswerId !== null };
    });
    const calculatedPercentage = currentQuizDataFromState.originalQuestionsForDisplay.length > 0 ? Math.round((calculatedScore / currentQuizDataFromState.originalQuestionsForDisplay.length) * 100) : 0;
    return { score: calculatedScore, percentage: calculatedPercentage, detailedResultsForCurrentQuiz: results };
  }, [currentQuizDataFromState]);

  const isShowingCurrentQuizResult = !!(currentQuizDataFromState && currentQuizDataFromState.originalQuestionsForDisplay && currentQuizDataFromState.originalQuestionsForDisplay.length > 0);

  useEffect(() => {
    if (selectedHistoricalResult && selectedHistoricalResult.questionsActuallyAttemptedIds && selectedHistoricalResult.userAnswersSnapshot) {
      const subjectKey = selectedHistoricalResult.subject?.toLowerCase();
      const subjectQuestions = allQuestionsData[subjectKey];
      if (!subjectQuestions) {
        console.error("Cannot find question bank for subject:", selectedHistoricalResult.subject);
        setProcessedHistoricalDetailedView([]);
        return;
      }

      const populatedQuestions = selectedHistoricalResult.questionsActuallyAttemptedIds.map(qId => {
        const fullQuestionData = subjectQuestions.find(q => q.id === qId);
        if (!fullQuestionData) {
          console.warn(`Question data for ID ${qId} not found in ${selectedHistoricalResult.subject} bank.`);
          return { id: qId, text: "Question data not found.", options: [], isCorrect: false, isAnswered: false, explanation: "Original question data missing." };
        }
        const userAnswerId = selectedHistoricalResult.userAnswersSnapshot[qId];
        const correctAnswerId = fullQuestionData.correctOptionId;
        const isCorrect = userAnswerId === correctAnswerId;
        return { ...fullQuestionData, userAnswerId, isCorrect, isAnswered: userAnswerId !== undefined && userAnswerId !== null };
      });
      setProcessedHistoricalDetailedView(populatedQuestions);
    } else {
      setProcessedHistoricalDetailedView([]);
    }
  }, [selectedHistoricalResult]);


  const fetchHistoricalData = useCallback(() => {
    setIsLoadingHistorical(true);
    setFetchError('');
    axios.get('/api/results')
      .then(response => {
        if (Array.isArray(response.data)) {
          setHistoricalResults(response.data);
        } else {
          console.error('[ResultsPage] Historical results API did not return an array:', response.data);
          setHistoricalResults([]);
          setFetchError('Received invalid data format for past results.');
        }
      })
      .catch(error => {
        console.error('[ResultsPage] Error fetching historical results:', error.response || error.message);
        setFetchError(`Failed to load past results: ${error.response?.data?.message || error.message}`);
        setHistoricalResults([]);
      })
      .finally(() => {
        setIsLoadingHistorical(false);
      });
  }, []);

  useEffect(() => {
    if (isShowingCurrentQuizResult && currentQuizDataFromState.questionsActuallyAttemptedIds && !isCurrentResultSaved) {
      const payload = {
        subject: currentQuizDataFromState.subject,
        topicId: currentQuizDataFromState.topicId,
        score: score,
        totalQuestions: currentQuizDataFromState.questionsActuallyAttemptedIds.length,
        percentage: percentage,
        timestamp: new Date().toISOString(),
        difficulty: currentQuizDataFromState.difficulty,
        numQuestionsConfigured: currentQuizDataFromState.numQuestionsConfigured,
        class: currentQuizDataFromState.quizClass,
        timeTaken: currentQuizDataFromState.timeTaken,
        questionsActuallyAttemptedIds: currentQuizDataFromState.questionsActuallyAttemptedIds,
        userAnswersSnapshot: currentQuizDataFromState.userAnswersSnapshot
      };
      axios.post('/api/results', payload)
        .then(response => {
          console.log('[ResultsPage] Quiz results saved successfully:', response.data);
          setIsCurrentResultSaved(true);
          fetchHistoricalData();
        })
        .catch(error => {
          console.error('[ResultsPage] Error saving quiz results:', error.response ? error.response.data : error.message);
          setFetchError(`Failed to save current quiz result: ${error.response?.data?.message || error.message}`);
        });
    }
  }, [isShowingCurrentQuizResult, currentQuizDataFromState, score, percentage, fetchHistoricalData, isCurrentResultSaved]);


  useEffect(() => {
    if (!isShowingCurrentQuizResult && !selectedHistoricalResult) {
      fetchHistoricalData();
    }
  }, [isShowingCurrentQuizResult, selectedHistoricalResult, fetchHistoricalData]);


  const handleHistoricalResultClick = (result) => setSelectedHistoricalResult(result);
  const handleBackToList = () => {
    setSelectedHistoricalResult(null);
  }

  const openDeleteConfirmation = (id) => {
    setResultToDeleteId(id);
    setDeleteConfirmationOpen(true);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!resultToDeleteId) return;
    setDeleteError('');
    try {
      await axios.delete(`/api/results/${resultToDeleteId}`);
      setHistoricalResults(prevResults => prevResults.filter(r => r.id !== resultToDeleteId));
      if (selectedHistoricalResult && selectedHistoricalResult.id === resultToDeleteId) {
        setSelectedHistoricalResult(null);
      }
      setDeleteConfirmationOpen(false);
      setResultToDeleteId(null);
    } catch (error) {
      console.error('[ResultsPage] Error deleting result:', error);
      setDeleteError(`Failed to delete result: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleNavigateHome = () => navigate('/');


  if (selectedHistoricalResult) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
        <QuizResultSummary
          quizResult={selectedHistoricalResult}
          quizTitle="Past Quiz Details"
          accentColor={subjectAccentColors[selectedHistoricalResult.subject?.toLowerCase()] || theme.palette.primary.main}
        />
        <QuestionBreakdown detailedQuestionsToDisplay={processedHistoricalDetailedView} />
        <ResultsActionButtons
          onBackToList={handleBackToList}
          onNavigateHome={handleNavigateHome}
          showBackToListButton={true}
          accentColor={subjectAccentColors[selectedHistoricalResult.subject?.toLowerCase()] || theme.palette.primary.main}
          showDeleteButton={true}
          onDeleteClick={() => openDeleteConfirmation(selectedHistoricalResult.id)}
          deleteDisabled={!selectedHistoricalResult.id}
        />
        <DeleteConfirmationDialog
          open={deleteConfirmationOpen}
          onClose={() => setDeleteConfirmationOpen(false)}
          onConfirm={handleConfirmDelete}
          error={deleteError}
        />
      </Box>
    );
  }

  if (isShowingCurrentQuizResult) {
    const currentQuizResultForView = {
      subject: currentQuizDataFromState.subject,
      topicId: currentQuizDataFromState.topicId,
      score: score,
      totalQuestions: currentQuizDataFromState.originalQuestionsForDisplay.length,
      percentage: percentage,
      difficulty: currentQuizDataFromState.difficulty,
      numQuestionsConfigured: currentQuizDataFromState.numQuestionsConfigured,
      class: currentQuizDataFromState.quizClass,
      timeTaken: currentQuizDataFromState.timeTaken
    };

    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
        <QuizResultSummary
          quizResult={currentQuizResultForView}
          quizTitle="Quiz Results"
          accentColor={currentQuizDataFromState.subjectAccentColor || theme.palette.primary.main}
        />
        <QuestionBreakdown detailedQuestionsToDisplay={detailedResultsForCurrentQuiz} />
        <ResultsActionButtons
          onNavigateHome={handleNavigateHome}
          showBackToListButton={false} // No "Back to List" for current results
          accentColor={currentQuizDataFromState.subjectAccentColor || theme.palette.primary.main}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, textAlign: 'center', color: theme.palette.primary.light, fontWeight: 'bold' }}>
        <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.3em' }} />
        Past Quiz Results
      </Typography>
      <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 3, color: theme.palette.text.secondary }}>
        A log of your previously completed quizzes. Click on an entry to view details.
      </Typography>

      {fetchError && <Alert severity="error" variant="filled" sx={{ mb: 2 }}>{fetchError}</Alert>}
      {deleteError && !deleteConfirmationOpen && <Alert severity="error" variant="filled" sx={{ mb: 2 }}>{deleteError}</Alert>}

      {isLoadingHistorical ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress /> <Typography sx={{ ml: 2 }}>Loading past results...</Typography>
        </Box>
      ) : historicalResults.length === 0 && !fetchError ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No Past Results Found</Typography>
          <Typography>Complete some quizzes to see your history here!</Typography>
          <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }} >
            Go to Home
          </Button>
        </Paper>
      ) : (
        <List>
          {Array.isArray(historicalResults) && historicalResults.map((result) => (
            <HistoricalResultItem
              key={result.id}
              result={result}
              onResultClick={handleHistoricalResultClick}
              onDeleteClick={openDeleteConfirmation} // Pass handler for delete icon
            />
          ))}
        </List>
      )}
      <ResultsActionButtons onNavigateHome={handleNavigateHome} showBackToListButton={false} />

      <DeleteConfirmationDialog
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        onConfirm={handleConfirmDelete}
        error={deleteError}
      />
    </Box>
  );
}

export default ResultsPage;