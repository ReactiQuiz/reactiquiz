// src/pages/QuizPage.tsx
/**
 * Quiz Page
 * 
 * This page displays the active quiz session with questions, timer,
 * and submission functionality. Users can answer questions, track
 * elapsed time, and submit their quiz results.
 */
import React from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { darken, useTheme } from '@mui/material/styles';
import { useQuiz } from '../hooks/useQuiz';
import { useSubjectColors } from '../contexts/SubjectColorsContext';
import QuizHeader from '../components/quiz/QuizHeader';
import QuizQuestionList from '../components/quiz/QuizQuestionList';

/**
 * Quiz Page Component
 * 
 * Displays the quiz taking interface with:
 * - Quiz header (topic info, timer, abandon button)
 * - Question list with answer options
 * - Real-time timer tracking
 * - Answer selection tracking
 * - Submit quiz button
 * - Loading states during quiz fetch
 * - Error message display
 * - Navigation on abandon/submit
 * - Subject-themed accent colors
 * 
 * This page is only accessible to authenticated users with an
 * active quiz session. Session ID is retrieved from URL params.
 * 
 * @returns {JSX.Element} Quiz page with questions and timer
 */
const QuizPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { getColor } = useSubjectColors();
  
  const {
    questions, userAnswers, isLoading, error, infoMessage,
    elapsedTime, timerActive, isSubmitting, quizContext,
    handleOptionSelect, submitAndNavigate, handleAbandonQuiz
  } = useQuiz();

  // Prioritize the accentColor passed in the quiz context (from useHomibhabha.js).
  // If it doesn't exist, then fall back to looking it up by the subject key.
  const accentColor = quizContext.accentColor || getColor(quizContext.subject);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: accentColor }} />
        <Typography sx={{ ml: 2 }}>Loading Quiz...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2, borderColor: accentColor, color: accentColor }}>
          Go Home
        </Button>
      </Box>
    );
  }

  if (infoMessage) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Alert severity="info">{infoMessage}</Alert>
        <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2, borderColor: accentColor, color: accentColor }}>
          Go Home
        </Button>
      </Box>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Alert severity="warning">No questions available for this quiz.</Alert>
        <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2, borderColor: accentColor, color: accentColor }}>
          Go Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 }, width: '100%' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, border: `1px solid ${accentColor}` }}>
        <QuizHeader
          topicName={quizContext.topicName}
          subject={quizContext.subject}
          difficulty={quizContext.difficulty}
          timeLimit={quizContext.timeLimit}
          elapsedTime={elapsedTime}
          timerActive={timerActive}
          accentColor={accentColor}
          onAbandonQuiz={handleAbandonQuiz}
        />
      </Paper>

      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
        <QuizQuestionList
          questions={questions}
          userAnswers={userAnswers}
          onOptionSelect={handleOptionSelect}
          accentColor={accentColor}
        />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          onClick={submitAndNavigate}
          disabled={isSubmitting}
          sx={{
            backgroundColor: accentColor,
            color: theme.palette.getContrastText(accentColor),
            '&:hover': {
              backgroundColor: darken(accentColor, 0.1),
            },
            minWidth: 200,
            py: 1.5,
          }}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Quiz'}
        </Button>
      </Box>
    </Box>
  );
};

export default QuizPage;
