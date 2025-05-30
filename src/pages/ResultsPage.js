// src/pages/ResultsPage.js
import {
  useMemo, useEffect, useState, useCallback
} from 'react';
import {
  useLocation, useNavigate
} from 'react-router-dom';
import {
  Box, Typography, Paper, List, Alert, CircularProgress, Button, useTheme,
} from '@mui/material';
import apiClient from '../api/axiosInstance'; 
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import LoginIcon from '@mui/icons-material/Login';

import { subjectAccentColors } from '../theme';
import QuizResultSummary from '../components/QuizResultSummary';
import QuestionBreakdown from '../components/QuestionBreakdown';
import HistoricalResultItem from '../components/HistoricalResultItem';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import ResultsActionButtons from '../components/ResultsActionButtons';


function ResultsPage({ currentUser }) { 
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const currentQuizDataFromState = location.state;

  const [historicalResults, setHistoricalResults] = useState([]);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [fetchError, setFetchError] = useState(''); // General fetch error
  const [detailsFetchError, setDetailsFetchError] = useState(''); // Specific for question details
  
  const [selectedHistoricalResult, setSelectedHistoricalResult] = useState(null);
  const [processedHistoricalDetailedView, setProcessedHistoricalDetailedView] = useState([]);
  const [isLoadingHistoricalDetails, setIsLoadingHistoricalDetails] = useState(false);

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [resultToDeleteId, setResultToDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

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
    savedToHistory                        
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

  const isShowingCurrentQuizResult = !!(originalQuestionsForDisplay && originalQuestionsForDisplay.length > 0 && currentQuizAttemptId);

  const fetchHistoricalData = useCallback(() => {
    if (!currentUser || !currentUser.id || !currentUser.token) {
      setHistoricalResults([]);
      setIsLoadingHistorical(false);
      setFetchError('');
      return;
    }
    setIsLoadingHistorical(true);
    setFetchError('');
    
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
        if (error.response?.status === 401) {
            console.warn("Session expired or invalid while fetching results.");
        }
      })
      .finally(() => {
        setIsLoadingHistorical(false);
      });
  }, [currentUser]); 
  
  useEffect(() => {
    if (selectedHistoricalResult && selectedHistoricalResult.questionsActuallyAttemptedIds && selectedHistoricalResult.userAnswersSnapshot) {
        setIsLoadingHistoricalDetails(true); 
        setDetailsFetchError(''); // Clear previous details error
        const topicIdToFetch = selectedHistoricalResult.topicId; 
        
        let headers = {};
        if (currentUser && currentUser.token) {
            headers.Authorization = `Bearer ${currentUser.token}`; // Though /api/questions is public, good practice if it ever becomes protected
        }
        
        apiClient.get(`/api/questions/${topicIdToFetch}`, { headers })
            .then(response => {
                const allTopicQuestions = response.data;
                if (!Array.isArray(allTopicQuestions)) {
                    console.error("Fetched questions for historical result is not an array:", allTopicQuestions);
                    setDetailsFetchError("Could not load question details: Invalid data format from server.");
                    setProcessedHistoricalDetailedView([]);
                    return;
                }

                if (allTopicQuestions.length === 0 && selectedHistoricalResult.questionsActuallyAttemptedIds.length > 0) {
                    console.warn(`No questions found in DB for topicId ${topicIdToFetch}, but result has attempted questions.`);
                    setDetailsFetchError(`Original questions for topic "${topicIdToFetch}" could not be found.`);
                }

                const populatedQuestions = selectedHistoricalResult.questionsActuallyAttemptedIds.map(qId => {
                    const fullQuestionData = allTopicQuestions.find(q => q.id === qId);
                    if (!fullQuestionData) {
                        console.warn(`Question data for ID ${qId} not found in fetched data for ${topicIdToFetch}.`);
                        return { id: qId, text: `Question data (ID: ${qId}) not found for this attempt.`, options: [], isCorrect: false, isAnswered: false, explanation: "Original question data could not be loaded." }; 
                    }
                    const userAnswerId = selectedHistoricalResult.userAnswersSnapshot[qId];
                    const isCorrect = userAnswerId === fullQuestionData.correctOptionId;
                    return { ...fullQuestionData, userAnswerId, isCorrect, isAnswered: userAnswerId !== undefined && userAnswerId !== null };
                });
                setProcessedHistoricalDetailedView(populatedQuestions);
            })
            .catch(err => {
                console.error("Error fetching question details for historical result:", err);
                setDetailsFetchError(`Failed to load detailed question information: ${err.response?.data?.message || err.message}`);
                setProcessedHistoricalDetailedView([]);
            })
            .finally(() => {
                setIsLoadingHistoricalDetails(false);
            });
    } else {
        setProcessedHistoricalDetailedView([]);
        if (selectedHistoricalResult) { // If a result is selected but has no question IDs
            setDetailsFetchError("No question data associated with this historical result to display details.");
        }
    }
  }, [selectedHistoricalResult, currentUser]); // Added currentUser to re-fetch if user changes while viewing


  useEffect(() => {
    if (!isShowingCurrentQuizResult && !selectedHistoricalResult) { 
      if (currentUser && currentUser.id) {
        fetchHistoricalData();
      } else {
        setHistoricalResults([]);
        setIsLoadingHistorical(false);
      }
    }
  }, [isShowingCurrentQuizResult, selectedHistoricalResult, currentUser, fetchHistoricalData]);

  const handleHistoricalResultClick = (result) => {
    setDetailsFetchError(''); // Clear previous errors when selecting a new result
    setSelectedHistoricalResult(result);
  };
  
  const handleBackToList = () => {
    setSelectedHistoricalResult(null);
    setProcessedHistoricalDetailedView([]); 
    setDetailsFetchError('');
    if (currentUser && currentUser.id) fetchHistoricalData(); 
  }

  const openDeleteConfirmation = (id) => { /* ... (same as before) ... */ };
  const handleConfirmDelete = async () => { /* ... (same as before, but fetchHistoricalData will re-fetch only user's results) ... */ };
  const handleNavigateHome = () => navigate('/');
  const handleNavigateToAccount = () => navigate('/account');


  if (selectedHistoricalResult) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
        <QuizResultSummary
          quizResult={selectedHistoricalResult} 
          quizTitle="Past Quiz Details"
          accentColor={subjectAccentColors[selectedHistoricalResult.subject?.toLowerCase()] || theme.palette.primary.main}
        />
        {isLoadingHistoricalDetails ? (
             <Box display="flex" justifyContent="center" alignItems="center" minHeight="20vh" sx={{my:2}}>
                <CircularProgress /> <Typography sx={{ml: 2}}>Loading question details...</Typography>
            </Box>
        ) : detailsFetchError ? (
             <Alert severity="error" sx={{mt: 2}}>{detailsFetchError}</Alert> 
        ) : processedHistoricalDetailedView.length > 0 ? (
            <QuestionBreakdown detailedQuestionsToDisplay={processedHistoricalDetailedView} />
        ) : (
             <Alert severity="info" sx={{mt: 2}}>No detailed question breakdown available or no questions were attempted for this result.</Alert>
        )}
        <ResultsActionButtons
            onBackToList={handleBackToList}
            onNavigateHome={handleNavigateHome}
            showBackToListButton={true}
            accentColor={subjectAccentColors[selectedHistoricalResult.subject?.toLowerCase()] || theme.palette.primary.main}
            showDeleteButton={currentUser && currentUser.id === selectedHistoricalResult.userId} 
            onDeleteClick={() => openDeleteConfirmation(selectedHistoricalResult.id)}
            deleteDisabled={!selectedHistoricalResult.id || !(currentUser && currentUser.id === selectedHistoricalResult.userId)}
        />
        <DeleteConfirmationDialog open={deleteConfirmationOpen} onClose={() => setDeleteConfirmationOpen(false)} onConfirm={handleConfirmDelete} error={deleteError} />
      </Box>
    );
  }

  if (isShowingCurrentQuizResult) {
    // ... (Rendering for current quiz result - same as previous response) ...
     const currentQuizResultForView = {
        subject: currentSubject,
        topicId: currentTopicIdFromState,
        score: score, 
        totalQuestions: originalQuestionsForDisplay.length,
        percentage: percentage, 
        difficulty: currentDifficulty,
        numQuestionsConfigured: currentNumQuestionsConfigured,
        class: currentQuizClass,
        timeTaken: currentTimeTaken
    };
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
        <QuizResultSummary 
            quizResult={currentQuizResultForView}
            quizTitle="Quiz Results"
            accentColor={currentSubjectAccentColor || theme.palette.primary.main}
        />
        {savedToHistory === false && !currentUser && (
            <Alert severity="info" sx={{my: 2}}>
                This result was not saved. Please <Button size="small" onClick={handleNavigateToAccount}>Login/Register</Button> to save future results.
            </Alert>
        )}
         {savedToHistory === false && currentUser && ( 
            <Alert severity="warning" sx={{my: 2}}>
                There was an issue saving this result to your history. It is displayed for this session only.
            </Alert>
        )}
        {savedToHistory === true && (
             <Alert severity="success" sx={{my: 2}}>
                This result has been saved to your history.
            </Alert>
        )}
        <QuestionBreakdown detailedQuestionsToDisplay={detailedResultsForCurrentQuiz} />
        <ResultsActionButtons 
            onNavigateHome={handleNavigateHome} 
            onViewHistory={() => {
                navigate('/results', { replace: true, state: null }); // Clear location state
                setSelectedHistoricalResult(null); 
                if (currentUser && currentUser.id) fetchHistoricalData();
            }}
            showBackToListButton={false} 
            showViewHistoryButton={true} 
            accentColor={currentSubjectAccentColor || theme.palette.primary.main}
        />
      </Box>
    );
  }

  // Display historical results or prompt to login (same as previous response)
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, textAlign: 'center', color: theme.palette.primary.light, fontWeight: 'bold' }}>
        <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.3em' }} />
        {currentUser ? `${currentUser.name}'s Quiz Results` : 'Past Quiz Results'}
      </Typography>
      
      {fetchError && !currentUser && <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>Could not load general history. {fetchError}</Alert>}
      {fetchError && currentUser && <Alert severity="error" variant="filled" sx={{ mb: 2 }}>{fetchError}</Alert>}
      {deleteError && !deleteConfirmationOpen && <Alert severity="error" variant="filled" sx={{ mb: 2 }}>{deleteError}</Alert>}

      {!currentUser ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" gutterBottom>Access Your Quiz History</Typography>
          <Typography sx={{mb: 2}}>Please log in to view your saved quiz results.</Typography>
          <Button variant="contained" startIcon={<LoginIcon />} onClick={handleNavigateToAccount} >
            Login / Register
          </Button>
        </Paper>
      ) : isLoadingHistorical ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress /> <Typography sx={{ ml: 2 }}>Loading your results...</Typography>
        </Box>
      ) : historicalResults.length === 0 && !fetchError ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No Saved Results Found</Typography>
          <Typography>You haven't completed and saved any quizzes yet under this account.</Typography>
          <Button variant="contained" startIcon={<HomeIcon />} onClick={handleNavigateHome} sx={{ mt: 2 }} >
            Go to Home & Take a Quiz
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
                showDeleteButton={currentUser && currentUser.id === result.userId}
            />
          ))}
        </List>
      )}
      {!selectedHistoricalResult && (
          <ResultsActionButtons onNavigateHome={handleNavigateHome} showBackToListButton={false} />
      )}

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