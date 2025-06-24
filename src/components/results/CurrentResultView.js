// src/components/results/CurrentResultView.js
import React from 'react';
import { Box, Alert, Button, Paper, Stack, Divider, Typography, useTheme} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import QuizResultSummary from './QuizResultSummary'; // Assuming path is correct
import QuestionBreakdown from './QuestionBreakdown';
import ResultsActionButtons from './ResultsActionButtons';
import { formatTime } from '../../utils/formatTime'; // Assuming path is correct
import { formatDisplayTopicName } from '../../utils/quizUtils'; // Assuming path is correct

function CurrentResultView({
  currentQuizDataFromState, // The full state object passed from QuizPage
  onViewHistory,
  onNavigateHome,
  onOpenChallengeSetup,
  currentUser
}) {
  const theme = useTheme();
const navigate = useNavigate();

  const {
    subject,
    topicId,
    topicName: topicNameFromQuizState, // Renamed for clarity from QuizPage's state
    difficulty,
    numQuestionsConfigured,
    actualNumQuestionsInQuiz,
    quizClass,
    timeTaken,
    originalQuestionsForDisplay, // Array of question objects with parsed options
    originalAnswersForDisplay,
    subjectAccentColor,
    score,
    percentage,
    savedToHistory,
    isChallenge,
    challengeDetails
  } = currentQuizDataFromState || {};

  if (!currentQuizDataFromState || !originalQuestionsForDisplay) {
    return <Alert severity="warning">No current quiz result data to display.</Alert>;
  }

  const effectiveAccentColor = subjectAccentColor || theme.palette.info.main;

  const currentQuizResultForSummary = {
    subject: subject,
    topicId: topicId,
    topicName: formatDisplayTopicName(topicId, topicNameFromQuizState, isChallenge, challengeDetails),
    score: score,
    totalQuestions: actualNumQuestionsInQuiz || originalQuestionsForDisplay.length,
    percentage: percentage,
    difficulty: difficulty,
    numQuestionsConfigured: numQuestionsConfigured, // For display in summary if needed
    class: quizClass,
    timeTaken: timeTaken,
    challenge_id: isChallenge ? challengeDetails?.id : null
  };

  // Prepare questions for QuestionBreakdown (if not already in desired format)
  const detailedResults = originalQuestionsForDisplay.map(question => {
    const userAnswerId = originalAnswersForDisplay ? originalAnswersForDisplay[question.id] : null;
    const isCorrect = userAnswerId === question.correctOptionId;
    return { ...question, userAnswerId, isCorrect, isAnswered: userAnswerId !== undefined && userAnswerId !== null };
  });

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '900px', margin: 'auto', mt: 2 }}>
      <QuizResultSummary
        quizResult={currentQuizResultForSummary}
        quizTitle={isChallenge ? "Challenge Results" : "Quiz Results"}
        accentColor={effectiveAccentColor}
      />

      {savedToHistory === false && !currentUser && (
        <Alert severity="info" sx={{ my: 2 }}>
          This result was not saved. Please <Button size="small" onClick={() => navigate('/account')}>Login/Register</Button> to save future results.
        </Alert>
      )}
      {savedToHistory === false && currentUser && (
        <Alert severity="warning" sx={{ my: 2 }}>
          There was an issue saving this result to your history. It is displayed for this session only.
        </Alert>
      )}
      {savedToHistory === true && (
        <Alert severity="success" sx={{ my: 2 }}>
          This result has been saved to your history.
        </Alert>
      )}

      {isChallenge && challengeDetails && (
        <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: alpha(theme.palette.info.dark, 0.1) }}>
          <Typography variant="h6" gutterBottom>Challenge Details</Typography>
          <Divider sx={{ mb: 1 }} />
          <Stack spacing={0.5}>
            <Typography>
              <strong>{currentUser?.id === challengeDetails.challenger_id ? 'You Challenged:' : 'Challenged by:'}</strong>{' '}
              {currentUser?.id === challengeDetails.challenger_id ? challengeDetails.challengedUsername : challengeDetails.challengerUsername}
            </Typography>
            <Typography>
              <strong>Topic:</strong> {formatDisplayTopicName(challengeDetails.topic_id, challengeDetails.topic_name, true, challengeDetails)}
            </Typography>
            <Typography>
              <strong>Your Score:</strong> {score}/{actualNumQuestionsInQuiz || originalQuestionsForDisplay?.length}
              {timeTaken != null && ` (${formatTime(timeTaken)})`}
            </Typography>
            {/* Display opponent's score if available */}
            {challengeDetails.challenger_id === currentUser?.id && challengeDetails.challenged_score !== null && (
                <Typography><strong>{challengeDetails.challengedUsername}'s Score:</strong> {challengeDetails.challenged_score}/{challengeDetails.num_questions} {challengeDetails.challenged_time_taken != null && ` (${formatTime(challengeDetails.challenged_time_taken)})`}</Typography>
            )}
            {challengeDetails.challenged_id === currentUser?.id && challengeDetails.challenger_score !== null && (
                <Typography><strong>{challengeDetails.challengerUsername}'s Score:</strong> {challengeDetails.challenger_score}/{challengeDetails.num_questions} {challengeDetails.challenger_time_taken != null && ` (${formatTime(challengeDetails.challenger_time_taken)})`}</Typography>
            )}
            {/* Winner status */}
            {challengeDetails.status === 'completed' && (
                <Typography sx={{ fontWeight: 'bold', mt: 1, color: challengeDetails.winner_id === null ? theme.palette.info.main : (challengeDetails.winner_id === currentUser?.id ? theme.palette.success.main : theme.palette.error.main)}}>
                    {challengeDetails.winner_id === null ? "It's a Tie!" : (challengeDetails.winner_id === currentUser?.id ? "🎉 You Won!" : `${challengeDetails.winnerUsername || 'Opponent'} Won.`)}
                </Typography>
            )}
             {challengeDetails.status === 'challenger_completed' && challengeDetails.challenger_id === currentUser?.id && (
                <Typography sx={{ fontStyle: 'italic', color: theme.palette.text.secondary, mt: 1 }}>Waiting for {challengeDetails.challengedUsername} to play.</Typography>
            )}
          </Stack>
        </Paper>
      )}

      {detailedResults && detailedResults.length > 0 &&
        <QuestionBreakdown detailedQuestionsToDisplay={detailedResults} />
      }
      <ResultsActionButtons
        onNavigateHome={onNavigateHome}
        onViewHistory={onViewHistory}
        showBackToListButton={false} // Not applicable for current result view
        showViewHistoryButton={true}
        accentColor={effectiveAccentColor}
        onChallengeFriend={() => onOpenChallengeSetup('current')} // Pass 'current' identifier
        showChallengeButton={currentUser && !isChallenge && originalQuestionsForDisplay && originalQuestionsForDisplay.length > 0}
        // Delete button not typically shown for current result immediately after quiz
      />
    </Box>
  );
}

export default CurrentResultView;