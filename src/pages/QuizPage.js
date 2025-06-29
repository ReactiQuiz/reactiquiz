// src/pages/QuizPage.js
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { darken, useTheme } from '@mui/material/styles';

import { useQuiz } from '../hooks/useQuiz';
import { useAuth } from '../contexts/AuthContext';
import { subjectAccentColors } from '../theme';
import QuizHeader from '../components/quiz/QuizHeader';
import QuizQuestionList from '../components/quiz/QuizQuestionList';

function QuizPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const {
    questions,
    userAnswers,
    isLoading,
    error,
    infoMessage,
    elapsedTime,
    timerActive,
    isSubmitting,
    quizContext,
    handleOptionSelect,
    submitAndNavigate,
    handleAbandonQuiz
  } = useQuiz();

  const accentColor = subjectAccentColors[quizContext.subject?.toLowerCase()] || quizContext.accentColor || theme.palette.primary.main;

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
          Back to {quizContext.subject ? quizContext.subject.charAt(0).toUpperCase() + quizContext.subject.slice(1) : 'Subjects'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '900px', margin: 'auto' }}>
      <QuizHeader
        quizType={quizContext.quizType}
        effectiveSubject={quizContext.subject}
        effectiveTopicName={quizContext.topicName}
        effectiveQuizClass={quizContext.quizClass}
        effectiveDifficulty={quizContext.difficulty}
        questionsLength={questions.length}
        currentChallengeDetails={quizContext.challengeId ? quizContext : null}
        currentUser={currentUser}
        timerActive={timerActive}
        elapsedTime={elapsedTime}
        effectiveTimeLimit={quizContext.timeLimit}
        accentColor={accentColor}
        infoMessage={infoMessage}
        onAbandon={handleAbandonQuiz}
      />

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
            minWidth: '200px',
          }}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Submit Quiz"}
        </Button>
      </Box>
    </Box>
  );
}

export default QuizPage;