import {
  useMemo, useEffect, useState, useCallback, useRef
} from 'react';
import {
  useLocation, useNavigate
} from 'react-router-dom';
import {
  Box, Typography, Paper, List, Alert, CircularProgress, Button, useTheme,
  darken, alpha
} from '@mui/material';
import axios from 'axios';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';

import { subjectAccentColors } from '../theme';
import QuizResultSummary from '../components/QuizResultSummary';
import QuestionBreakdown from '../components/QuestionBreakdown';
import HistoricalResultItem from '../components/HistoricalResultItem';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import ResultsActionButtons from '../components/ResultsActionButtons';
import { formatTime } from '../utils/formatTime';


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
  const [isLoadingHistoricalDetails, setIsLoadingHistoricalDetails] = useState(false);

  const processedAttemptIdRef = useRef(null); 


  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [resultToDeleteId, setResultToDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const {
    quizAttemptId: currentQuizAttemptId,
    subject: currentSubject,
    topicId: currentTopicId,
    difficulty: currentDifficulty,
    numQuestionsConfigured: currentNumQuestionsConfigured,
    quizClass: currentQuizClass,
    timeTaken: currentTimeTaken,
    questionsActuallyAttemptedIds: currentQuestionsActuallyAttemptedIds,
    userAnswersSnapshot: currentUserAnswersSnapshot,
    originalQuestionsForDisplay: currentOriginalQuestionsForDisplay,
    originalAnswersForDisplay: currentOriginalAnswersForDisplay,
    subjectAccentColor: currentSubjectAccentColor
  } = useMemo(() => {
    return currentQuizDataFromState || {};
  }, [currentQuizDataFromState]);


  const { score, percentage, detailedResultsForCurrentQuiz } = useMemo(() => {
    if (!currentOriginalAnswersForDisplay || !currentOriginalQuestionsForDisplay || !Array.isArray(currentOriginalQuestionsForDisplay) || currentOriginalQuestionsForDisplay.length === 0) {
      return { score: 0, percentage: 0, detailedResultsForCurrentQuiz: [] };
    }
    let calculatedScore = 0;
    const results = currentOriginalQuestionsForDisplay.map(question => {
      const userAnswerId = currentOriginalAnswersForDisplay[question.id];
      const correctAnswerId = question.correctOptionId;
      const isCorrect = userAnswerId === correctAnswerId;
      if (isCorrect) calculatedScore++;
      return { ...question, userAnswerId, isCorrect, isAnswered: userAnswerId !== undefined && userAnswerId !== null };
    });
    const calculatedPercentage = currentOriginalQuestionsForDisplay.length > 0 ? Math.round((calculatedScore / currentOriginalQuestionsForDisplay.length) * 100) : 0;
    return { score: calculatedScore, percentage: calculatedPercentage, detailedResultsForCurrentQuiz: results };
  }, [currentOriginalAnswersForDisplay, currentOriginalQuestionsForDisplay]);

  const isShowingCurrentQuizResult = !!(currentOriginalQuestionsForDisplay && currentOriginalQuestionsForDisplay.length > 0 && currentQuizAttemptId);

  // Effect for fetching historical data
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
  
  // Effect for saving the current quiz result
  useEffect(() => {
    if (isShowingCurrentQuizResult && currentQuestionsActuallyAttemptedIds && currentQuizAttemptId && currentQuizAttemptId !== processedAttemptIdRef.current) {
      
      console.log(`[ResultsPage] Attempting to save current quiz result. Attempt ID: ${currentQuizAttemptId}, Previously processed: ${processedAttemptIdRef.current}`);
      processedAttemptIdRef.current = currentQuizAttemptId; 

      const payload = {
        subject: currentSubject,
        topicId: currentTopicId,
        score: score, 
        totalQuestions: currentQuestionsActuallyAttemptedIds.length, 
        percentage: percentage, 
        timestamp: new Date().toISOString(),
        difficulty: currentDifficulty,
        numQuestionsConfigured: currentNumQuestionsConfigured,
        class: currentQuizClass,
        timeTaken: currentTimeTaken,
        questionsActuallyAttemptedIds: currentQuestionsActuallyAttemptedIds,
        userAnswersSnapshot: currentUserAnswersSnapshot
      };

      axios.post('/api/results', payload)
        .then(response => {
          console.log('[ResultsPage] Quiz results saved successfully:', response.data, "for attempt ID:", currentQuizAttemptId);
          fetchHistoricalData(); 
        })
        .catch(error => { 
            console.error('[ResultsPage] Error saving quiz results for attempt ID:', currentQuizAttemptId, error.response ? error.response.data : error.message); 
            setFetchError(`Failed to save current quiz result: ${error.response?.data?.message || error.message}`);
            if (error.response && error.response.status === 409) {
                console.log("[ResultsPage] Save was rejected by backend as duplicate.");
                fetchHistoricalData(); 
            }
        });
    }
  }, [
      isShowingCurrentQuizResult, 
      currentSubject, 
      currentTopicId, 
      score, 
      percentage, 
      currentDifficulty, 
      currentNumQuestionsConfigured, 
      currentQuizClass, 
      currentTimeTaken, 
      currentQuestionsActuallyAttemptedIds, 
      currentUserAnswersSnapshot, 
      currentQuizAttemptId, 
      fetchHistoricalData
    ]);


  // Effect for populating detailed view for a selected historical result
  useEffect(() => {
    if (selectedHistoricalResult && selectedHistoricalResult.questionsActuallyAttemptedIds && selectedHistoricalResult.userAnswersSnapshot) {
        setIsLoadingHistoricalDetails(true); 
        const topicId = selectedHistoricalResult.topicId;
        
        axios.get(`/api/questions/${topicId}`) // Fetch all questions for that topic using only topicId
            .then(response => {
                const allTopicQuestions = response.data;
                if (!Array.isArray(allTopicQuestions)) {
                    console.error("Fetched questions for historical result is not an array:", allTopicQuestions);
                    setFetchError("Could not load question details for this historical result.");
                    setProcessedHistoricalDetailedView([]);
                    setIsLoadingHistoricalDetails(false);
                    return;
                }

                const populatedQuestions = selectedHistoricalResult.questionsActuallyAttemptedIds.map(qId => {
                    const fullQuestionData = allTopicQuestions.find(q => q.id === qId);
                    if (!fullQuestionData) {
                        console.warn(`Question data for ID ${qId} not found in fetched data for ${topicId}.`);
                        return { id: qId, text: "Question data not found.", options: [], isCorrect: false, isAnswered: false, explanation: "Original question data could not be loaded." }; 
                    }
                    const userAnswerId = selectedHistoricalResult.userAnswersSnapshot[qId];
                    const isCorrect = userAnswerId === fullQuestionData.correctOptionId;
                    return { ...fullQuestionData, userAnswerId, isCorrect, isAnswered: userAnswerId !== undefined && userAnswerId !== null };
                });
                setProcessedHistoricalDetailedView(populatedQuestions);
            })
            .catch(err => {
                console.error("Error fetching question details for historical result:", err);
                setFetchError("Failed to load detailed question information for this past quiz.");
                setProcessedHistoricalDetailedView([]);
            })
            .finally(() => {
                setIsLoadingHistoricalDetails(false);
            });
    } else {
        setProcessedHistoricalDetailedView([]);
    }
  }, [selectedHistoricalResult]);


  // Initial fetch of historical data if not showing current results
  useEffect(() => {
    if (!isShowingCurrentQuizResult && !selectedHistoricalResult) {
      fetchHistoricalData();
    }
  }, [isShowingCurrentQuizResult, selectedHistoricalResult, fetchHistoricalData]);

  const handleHistoricalResultClick = (result) => setSelectedHistoricalResult(result);
  const handleBackToList = () => {
    setSelectedHistoricalResult(null);
    setProcessedHistoricalDetailedView([]); 
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
        {isLoadingHistoricalDetails ? (
             <Box display="flex" justifyContent="center" alignItems="center" minHeight="20vh">
                <CircularProgress />
                <Typography sx={{ml: 2}}>Loading question details...</Typography>
            </Box>
        ) : processedHistoricalDetailedView.length > 0 ? (
            <QuestionBreakdown detailedQuestionsToDisplay={processedHistoricalDetailedView} />
        ) : (
             fetchError && !isLoadingHistoricalDetails ? 
             <Alert severity="error" sx={{mt: 2}}>{fetchError}</Alert> 
             : <Alert severity="warning" sx={{mt: 2}}>Could not load question details for this result or no questions were attempted.</Alert>
        )}
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
        subject: currentSubject,
        topicId: currentTopicId,
        score: score, 
        totalQuestions: currentOriginalQuestionsForDisplay.length,
        percentage: percentage, 
        difficulty: currentDifficulty,
        numQuestionsConfigured: currentNumQuestionsConfigured,
        class: currentQuizClass,
        timeTaken: currentTimeTaken
    };

    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
        {fetchError && <Alert severity="error" variant="filled" sx={{ mb: 2 }}>{fetchError}</Alert>}
        <QuizResultSummary 
            quizResult={currentQuizResultForView}
            quizTitle="Quiz Results"
            accentColor={currentSubjectAccentColor || theme.palette.primary.main}
        />
        <QuestionBreakdown detailedQuestionsToDisplay={detailedResultsForCurrentQuiz} />
        <ResultsActionButtons 
            onNavigateHome={handleNavigateHome} 
            showBackToListButton={false} 
            accentColor={currentSubjectAccentColor || theme.palette.primary.main}
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
                onDeleteClick={openDeleteConfirmation}
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