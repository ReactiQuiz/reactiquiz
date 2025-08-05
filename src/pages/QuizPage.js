// src/pages/QuizPage.js
import { Box, Typography, Button, CircularProgress, Alert, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { darken, useTheme } from '@mui/material/styles';
import { useQuiz } from '../hooks/useQuiz';
import { useAuth } from '../contexts/AuthContext';
import { useSubjectColors } from '../contexts/SubjectColorsContext';
import QuizHeader from '../components/quiz/QuizHeader';
import QuizQuestionList from '../components/quiz/QuizQuestionList';

function QuizPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getColor } = useSubjectColors();
  
  const {
    questions, userAnswers, isLoading, error, infoMessage,
    elapsedTime, timerActive, isSubmitting, quizContext,
    handleOptionSelect, submitAndNavigate, handleAbandonQuiz
  } = useQuiz();

  // --- START OF THE DEFINITIVE FIX ---
  // Prioritize the accentColor passed in the quiz context (from useHomibhabha.js).
  // If it doesn't exist, then fall back to looking it up by the subject key.
  const accentColor = quizContext.accentColor || getColor(quizContext.subject);
  // --- END OF THE DEFINITIVE FIX ---

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
          Back to Home
        </Button>
      </Box>
    );
  }

  if (!isLoading && questions.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>No Questions Available</Typography>
        <Typography>No questions are currently available for the selected settings. Please try again.</Typography>
        <Button variant="outlined" onClick={() => navigate(quizContext.subject ? `/subjects/${quizContext.subject}` : '/subjects')} sx={{ mt: 3, borderColor: accentColor, color: accentColor }}>
          Back to Topics
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '900px', margin: 'auto' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderTop: `4px solid ${accentColor}` }}>
        <QuizHeader
          effectiveSubject={quizContext.subject}
          effectiveTopicName={quizContext.topicName}
          effectiveDifficulty={quizContext.difficulty}
          questionsLength={questions.length}
          timerActive={timerActive}
          elapsedTime={elapsedTime}
          effectiveTimeLimit={quizContext.timeLimit}
          accentColor={accentColor}
          infoMessage={infoMessage}
          onAbandon={handleAbandonQuiz}
        />
      </Paper>
      <QuizQuestionList
        questions={questions}
        userAnswers={userAnswers}
        onOptionSelect={handleOptionSelect}
        currentAccentColor={accentColor}
      />
      <Box display="flex" justifyContent="center" sx={{ mt: 3, mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => submitAndNavigate()}
          disabled={isSubmitting || questions.length === 0}
          sx={{
            backgroundColor: accentColor,
            color: theme.palette.getContrastText(accentColor),
            '&:hover': { backgroundColor: darken(accentColor, 0.15) },
            minWidth: '220px', py: 1.5, fontSize: '1.1rem'
          }}
        >
          {isSubmitting ? <CircularProgress size={26} color="inherit" /> : "Submit Quiz"}
        </Button>
      </Box>
    </Box>
  );
}

export default QuizPage;