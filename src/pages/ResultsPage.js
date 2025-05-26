import {
  useMemo, useEffect, useState, useCallback
} from 'react';
import {
  useLocation, useNavigate
} from 'react-router-dom';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, Button, Divider, useTheme, alpha, darken, Alert, Chip, CircularProgress, ButtonBase, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import {
  subjectAccentColors as themeSubjectAccentColors
} from '../theme';
import axios from 'axios';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ReplayIcon from '@mui/icons-material/Replay';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import TimerIcon from '@mui/icons-material/Timer'; // Import TimerIcon
import { formatTime } from '../utils/formatTime'; // Import the utility

const subjectAccentColors = themeSubjectAccentColors;

const formatTopicName = (topicId) => {
  if (!topicId) return 'N/A';
  let name = topicId.replace(/-/g, ' ');

  const classSuffixRegex = /\s(\d+(?:st|nd|rd|th))$/i;
  name = name.replace(classSuffixRegex, '').trim();

  return name.replace(/\b\w/g, l => l.toUpperCase());
};

function QuizDetailView({
  quizResult,
  quizTitle,
  detailedQuestionsToDisplay,
  accentColor,
  onBackToList,
  onRetryQuiz,
  onDeleteQuiz
}) {
  const theme = useTheme();
  const successColor = theme.palette.success.main;
  const errorColor = theme.palette.error.main;
  const neutralColor = theme.palette.grey[700];
  const navigate = useNavigate();
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  const { subject, topicId, score, totalQuestions, percentage, difficulty, numQuestionsConfigured, id: resultId, class: quizClassFromResult, timeTaken } = quizResult || {};
  const topicName = formatTopicName(topicId);

  if (!quizResult) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: effectiveAccentColor }} />
        <Typography sx={{ ml: 2 }}>Loading quiz details...</Typography>
      </Box>
    );
  }


  return (
    <Box>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, textAlign: 'center', borderTop: `5px solid ${effectiveAccentColor}` }}>
        <Typography variant="h3" gutterBottom sx={{ color: effectiveAccentColor, fontWeight: 'bold' }}>
          {quizTitle || "Quiz Results"}
        </Typography>
        <Typography variant="h5" component="div" gutterBottom>
          <Typography variant="h6" component="span" sx={{ textTransform: 'capitalize', color: theme.palette.text.secondary }}>
            {topicName}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 0.5, mb: 1 }}>
            {quizClassFromResult && <Chip label={`Class ${quizClassFromResult}`} size="small" variant="outlined" />}
            {difficulty && <Chip label={difficulty} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />}
            {numQuestionsConfigured != null && <Chip label={`${numQuestionsConfigured} Qs Config.`} size="small" variant="outlined" />}
            {timeTaken != null && <Chip icon={<TimerIcon fontSize="small" />} label={formatTime(timeTaken)} size="small" variant="outlined" />}
          </Box>
          <Divider sx={{ my: 1.5 }} />
          Score:
          <Typography component="span" variant="h4" sx={{ color: effectiveAccentColor, fontWeight: 'bold', ml: 1 }}>
            {score} / {totalQuestions}
          </Typography>
          <Typography component="span" variant="h5" sx={{ color: effectiveAccentColor, ml: 0.5 }}>
            ({percentage}%)
          </Typography>
        </Typography>
        {percentage === 100 && <Alert severity="success" variant="filled" sx={{ mt: 2 }}>Excellent! You got all questions correct!</Alert>}
        {percentage >= 70 && percentage < 100 && <Alert severity="info" variant="filled" sx={{ mt: 2 }}>Great job! You have a good understanding.</Alert>}
        {percentage >= 50 && percentage < 70 && <Alert severity="warning" variant="filled" sx={{ mt: 2 }}>Not bad! Review the incorrect answers to improve.</Alert>}
        {percentage < 50 && <Alert severity="error" variant="filled" sx={{ mt: 2 }}>Keep practicing! Review the explanations to learn more.</Alert>}
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', color: theme.palette.text.primary }}>
        Detailed Breakdown
      </Typography>
      {detailedQuestionsToDisplay.map((result, index) => (
        <Paper key={result.id || `q-${index}`} elevation={2} sx={{ mb: 3, p: { xs: 2, sm: 2.5 }, borderLeft: `4px solid ${result.isCorrect ? successColor : (result.isAnswered ? errorColor : neutralColor)}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 500, color: theme.palette.text.primary }}> Question {index + 1} </Typography>
            {result.isAnswered ? (result.isCorrect ?
              <Chip icon={<CheckCircleOutlineIcon />} label="Correct" color="success" size="small" variant="outlined" /> :
              <Chip icon={<HighlightOffIcon />} label="Incorrect" color="error" size="small" variant="outlined" />
            ) : (<Chip label="Not Answered" size="small" variant="outlined" />)}
          </Box>
          <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.primary, whiteSpace: 'pre-wrap' }}>{result.text}</Typography>
          <List dense sx={{ py: 0, mb: result.explanation ? 1.5 : 0 }}>
            {result.options.map(opt => {
              const isUserSelected = opt.id === result.userAnswerId;
              const isCorrectAnswer = opt.id === result.correctOptionId;
              let optionStyle = {};
              let icon = <RadioButtonUncheckedIcon fontSize="small" sx={{ color: theme.palette.action.disabled }} />;
              if (isCorrectAnswer) {
                optionStyle = { backgroundColor: alpha(successColor, 0.2), border: `1px solid ${alpha(successColor, 0.4)}`, color: theme.palette.success.light };
                icon = <CheckCircleOutlineIcon fontSize="small" sx={{ color: successColor }} />;
              }
              if (isUserSelected) {
                icon = <RadioButtonCheckedIcon fontSize="small" sx={{ color: isCorrectAnswer ? successColor : errorColor }} />;
                if (!isCorrectAnswer) {
                  optionStyle = { ...optionStyle, backgroundColor: alpha(errorColor, 0.2), border: `1px solid ${alpha(errorColor, 0.4)}`, color: theme.palette.error.light };
                } else { optionStyle.fontWeight = 'bold'; }
              }
              return (
                <ListItem key={opt.id} sx={{ my: 0.5, borderRadius: theme.shape.borderRadius, py: 1, px: 1.5, border: `1px solid ${theme.palette.divider}`, transition: 'background-color 0.2s, border-color 0.2s', ...optionStyle }} >
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, alignItems: 'center' }}>{icon}</ListItemIcon>
                  <ListItemText primary={opt.text} primaryTypographyProps={{ variant: 'body1', fontWeight: isUserSelected ? 'bold' : 'normal', color: optionStyle.color || theme.palette.text.primary, whiteSpace: 'pre-wrap' }} />
                </ListItem>
              );
            })}
          </List>
          {result.explanation && (
            <Paper elevation={0} sx={{ mt: 1.5, p: 1.5, backgroundColor: alpha(theme.palette.info.dark, 0.2), borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.info.light, fontWeight: 'bold', mb: 0.5 }}>Explanation:</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{result.explanation}</Typography>
            </Paper>
          )}
          <Divider sx={{ mt: 2, display: index === detailedQuestionsToDisplay.length - 1 ? 'none' : 'block' }} />
        </Paper>
      ))}
      <Box sx={{ mt: 4, py: 2, display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {onBackToList && (
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBackToList}
            sx={{ borderColor: effectiveAccentColor, color: effectiveAccentColor, '&:hover': { borderColor: darken(effectiveAccentColor, 0.15), backgroundColor: alpha(effectiveAccentColor, 0.08) }, minWidth: '180px' }}
          > Back to List </Button>
        )}
        <Button variant="outlined" startIcon={<HomeIcon />} onClick={() => navigate('/')}
          sx={{ borderColor: effectiveAccentColor, color: effectiveAccentColor, '&:hover': { borderColor: darken(effectiveAccentColor, 0.15), backgroundColor: alpha(effectiveAccentColor, 0.08) }, minWidth: '180px' }}
        > Home </Button>
        {onRetryQuiz && subject && topicId && (
          <Button variant="contained" startIcon={<ReplayIcon />} onClick={onRetryQuiz}
            sx={{ backgroundColor: effectiveAccentColor, color: theme.palette.getContrastText(effectiveAccentColor), '&:hover': { backgroundColor: darken(effectiveAccentColor, 0.15) }, minWidth: '180px' }}
          > Retry Quiz </Button>
        )}
        {onDeleteQuiz && resultId && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDeleteQuiz(resultId)}
            sx={{ minWidth: '180px' }}
          >
            Delete This Result
          </Button>
        )}
      </Box>
    </Box>
  );
}

function DeleteConfirmationDialog({ open, onClose, onConfirm, error }) {
  const theme = useTheme();
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="delete-confirmation-title">
      <DialogTitle id="delete-confirmation-title">Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this quiz result? This action cannot be undone.
        </DialogContentText>
        {error && <Alert severity="error" sx={{ mt: 2 }} variant="filled">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: theme.palette.text.secondary }}>Cancel</Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}


function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const currentQuizData = location.state;

  const [historicalResults, setHistoricalResults] = useState([]);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [selectedHistoricalResult, setSelectedHistoricalResult] = useState(null);

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [resultToDeleteId, setResultToDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const { score, percentage, detailedResults } = useMemo(() => {
    if (!currentQuizData || !currentQuizData.answers || !currentQuizData.questions || !Array.isArray(currentQuizData.questions) || currentQuizData.questions.length === 0) {
      return { score: 0, percentage: 0, detailedResults: [] };
    }
    let calculatedScore = 0;
    const results = currentQuizData.questions.map(question => {
      const userAnswerId = currentQuizData.answers[question.id];
      const correctAnswerId = question.correctOptionId;
      const isCorrect = userAnswerId === correctAnswerId;
      if (isCorrect) calculatedScore++;
      const userAnswerText = question.options.find(opt => opt.id === userAnswerId)?.text;
      const correctAnswerText = question.options.find(opt => opt.id === correctAnswerId)?.text;
      return { ...question, userAnswerId, userAnswerText, correctAnswerId, correctAnswerText, isCorrect, isAnswered: userAnswerId !== undefined && userAnswerId !== null, };
    });
    const calculatedPercentage = currentQuizData.questions.length > 0 ? Math.round((calculatedScore / currentQuizData.questions.length) * 100) : 0;
    return { score: calculatedScore, percentage: calculatedPercentage, detailedResults: results };
  }, [currentQuizData]);

  const isShowingCurrentQuizResult = !!(currentQuizData && detailedResults.length > 0);

  const historicalDetailedViewData = useMemo(() => {
    if (!selectedHistoricalResult || !selectedHistoricalResult.userAnswersSnapshot || !selectedHistoricalResult.questionsAttempted || !Array.isArray(selectedHistoricalResult.questionsAttempted)) {
      return [];
    }
    return selectedHistoricalResult.questionsAttempted.map(question => {
      const userAnswerId = selectedHistoricalResult.userAnswersSnapshot[question.id];
      const correctAnswerId = question.correctOptionId;
      const isCorrect = userAnswerId === correctAnswerId;
      const userAnswerText = question.options.find(opt => opt.id === userAnswerId)?.text;
      const correctAnswerText = question.options.find(opt => opt.id === correctAnswerId)?.text;
      return { ...question, userAnswerId, userAnswerText, correctAnswerText, isCorrect, isAnswered: userAnswerId !== undefined && userAnswerId !== null, };
    });
  }, [selectedHistoricalResult]);

  const fetchHistoricalData = useCallback(() => {
    setIsLoadingHistorical(true);
    setFetchError('');
    axios.get('/api/results')
      .then(response => {
        setHistoricalResults(response.data);
      })
      .catch(error => {
        console.error('Error fetching historical results:', error);
        setFetchError('Failed to load past results. Please try again later.');
      })
      .finally(() => {
        setIsLoadingHistorical(false);
      });
  }, []);

  useEffect(() => {
    if (isShowingCurrentQuizResult) {
      const payload = {
        subject: currentQuizData.subject,
        topicId: currentQuizData.topicId,
        score: score,
        totalQuestions: currentQuizData.questions.length,
        percentage: percentage,
        timestamp: new Date().toISOString(),
        difficulty: currentQuizData.difficulty,
        numQuestionsConfigured: currentQuizData.numQuestionsConfigured,
        class: currentQuizData.quizClass,
        timeTaken: currentQuizData.timeTaken, // Add timeTaken to payload
        questionsAttempted: currentQuizData.questions,
        userAnswersSnapshot: currentQuizData.answers
      };
      axios.post('/api/results', payload)
        .then(response => {
          console.log('Quiz results saved successfully:', response.data);
          fetchHistoricalData();
        })
        .catch(error => { console.error('Error saving quiz results:', error.response ? error.response.data : error.message); });
    }
  }, [isShowingCurrentQuizResult, currentQuizData, score, percentage, fetchHistoricalData]); // currentQuizData includes timeTaken


  useEffect(() => {
    if (!isShowingCurrentQuizResult && !selectedHistoricalResult) {
      fetchHistoricalData();
    }
  }, [isShowingCurrentQuizResult, selectedHistoricalResult, fetchHistoricalData]);


  const handleHistoricalResultClick = (result) => setSelectedHistoricalResult(result);
  const handleBackToList = () => setSelectedHistoricalResult(null);

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
      console.error('Error deleting result:', error);
      setDeleteError(`Failed to delete result: ${error.response?.data?.message || error.message}`);
    }
  };


  if (selectedHistoricalResult) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
        <QuizDetailView
          quizResult={selectedHistoricalResult}
          quizTitle="Past Quiz Details"
          detailedQuestionsToDisplay={historicalDetailedViewData}
          accentColor={subjectAccentColors[selectedHistoricalResult.subject?.toLowerCase()] || theme.palette.primary.main}
          onBackToList={handleBackToList}
          onRetryQuiz={() => navigate(`/quiz/${selectedHistoricalResult.subject}/${selectedHistoricalResult.topicId}`, {
            state: {
              difficulty: selectedHistoricalResult.difficulty,
              numQuestions: selectedHistoricalResult.numQuestionsConfigured || selectedHistoricalResult.totalQuestions,
              topicName: formatTopicName(selectedHistoricalResult.topicId),
              accentColor: subjectAccentColors[selectedHistoricalResult.subject?.toLowerCase()] || theme.palette.primary.main,
              quizClass: selectedHistoricalResult.class
            }
          })}
          onDeleteQuiz={openDeleteConfirmation}
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
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
        <QuizDetailView
          quizResult={{
            ...currentQuizData,
            score: score,
            percentage: percentage,
            totalQuestions: currentQuizData.questions.length,
            topicId: currentQuizData.topicId,
            class: currentQuizData.quizClass,
            timeTaken: currentQuizData.timeTaken // Ensure timeTaken is passed here
          }}
          quizTitle="Quiz Results"
          detailedQuestionsToDisplay={detailedResults}
          accentColor={currentQuizData.subjectAccentColor || theme.palette.primary.main}
          onRetryQuiz={() => navigate(`/quiz/${currentQuizData.subject}/${currentQuizData.topicId}`, {
            state: {
              difficulty: currentQuizData.difficulty,
              numQuestions: currentQuizData.numQuestionsConfigured,
              topicName: formatTopicName(currentQuizData.topicId),
              accentColor: currentQuizData.subjectAccentColor,
              quizClass: currentQuizData.quizClass
            }
          })}
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
          {historicalResults.map((result) => (
            <Paper
              component={ButtonBase}
              onClick={() => handleHistoricalResultClick(result)}
              sx={{
                width: '100%', textAlign: 'left', display: 'block', mb: 2, borderRadius: 2, overflow: 'hidden',
                borderLeft: `5px solid ${subjectAccentColors[result.subject?.toLowerCase()] || theme.palette.grey[500]}`,
                '&:hover': { boxShadow: theme.shadows[6], backgroundColor: alpha(theme.palette.action.hover, 0.08) },
                p: 0
              }}
              key={result.id}
              elevation={2}
            >
              <ListItem sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', sm: { alignItems: 'center' }, gap: { xs: 1, sm: 2 }, py: 1.5, px: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" sx={{ textTransform: 'capitalize', fontWeight: 500, color: subjectAccentColors[result.subject?.toLowerCase()] || theme.palette.primary.light }}>
                    {formatTopicName(result.topicId)}
                  </Typography>
                  <Typography component="div" variant="body2" color="text.secondary">
                    Score: {result.score}/{result.totalQuestions}
                    {result.class && <Chip label={`Class ${result.class}`} size="small" sx={{ ml: 1, backgroundColor: alpha(theme.palette.text.secondary, 0.3), color: theme.palette.text.primary, textTransform: 'capitalize' }} />}
                    {result.difficulty && <Chip label={result.difficulty} size="small" sx={{ ml: 1, textTransform: 'capitalize', backgroundColor: alpha(theme.palette.info.dark, 0.3) }} />}
                    {result.numQuestionsConfigured != null && <Chip label={`${result.numQuestionsConfigured} Qs`} size="small" sx={{ ml: 1, backgroundColor: alpha(theme.palette.secondary.dark, 0.3) }} />}
                    {/* Display Time Taken Chip */}
                    {result.timeTaken != null && (
                      <Chip
                        icon={<TimerIcon fontSize="small" />}
                        label={formatTime(result.timeTaken)}
                        size="small"
                        sx={{ ml: 1, backgroundColor: alpha(theme.palette.grey[700], 0.3) }}
                      />
                    )}
                  </Typography>
                  <Typography component="div" variant="caption" color="text.secondary">
                    Taken on: {new Date(result.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 1, sm: 0 }, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                  <Chip
                    label={`${result.percentage}%`}
                    sx={{
                      fontWeight: 'bold', fontSize: '1.1rem', px: 1,
                      backgroundColor: result.percentage >= 70 ? alpha(theme.palette.success.dark, 0.3) : result.percentage >= 50 ? alpha(theme.palette.warning.dark, 0.3) : alpha(theme.palette.error.dark, 0.3),
                      color: result.percentage >= 70 ? theme.palette.success.light : result.percentage >= 50 ? theme.palette.warning.light : theme.palette.error.light,
                      border: `1px solid ${result.percentage >= 70 ? theme.palette.success.main : result.percentage >= 50 ? theme.palette.warning.main : theme.palette.error.main}`
                    }}
                  />
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteConfirmation(result.id);
                    }}
                    sx={{ p: 0.5, minWidth: 'auto', color: theme.palette.error.light, '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.2) } }}
                    aria-label={`Delete result for ${formatTopicName(result.topicId)}`}
                  >
                    <DeleteIcon />
                  </Button>
                </Box>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
      <Box sx={{ mt: 4, py: 2, display: 'flex', justifyContent: 'center' }}>
        <Button variant="outlined" startIcon={<HomeIcon />} onClick={() => navigate('/')}
          sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main, '&:hover': { borderColor: darken(theme.palette.primary.main, 0.15), backgroundColor: alpha(theme.palette.primary.main, 0.08) }, minWidth: { xs: '100%', sm: '200px' } }}
        > Back to Home </Button>
      </Box>

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