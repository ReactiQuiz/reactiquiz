// src/components/quiz/QuizHeader.js
import React from 'react';
import { Box, Typography, useTheme, alpha, Alert, Button } from '@mui/material';
import { formatTime } from '../../utils/formatTime';
import ReplayIcon from '@mui/icons-material/Replay';

function QuizHeader({
  quizType,
  effectiveSubject,
  effectiveTopicName,
  effectiveQuizClass,
  effectiveDifficulty,
  questionsLength,
  currentChallengeDetails,
  currentUser,
  timerActive,
  elapsedTime,
  effectiveTimeLimit,
  accentColor,
  infoMessage,
  onAbandon // New prop for abandoning the quiz
}) {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  const displayTime = effectiveTimeLimit ? Math.max(0, effectiveTimeLimit - elapsedTime) : elapsedTime;

  const baseTimerColorForAlpha = effectiveTimeLimit && displayTime < 600
    ? theme.palette.error.main
    : theme.palette.text.primary;
  const timerDisplayTextColor = effectiveTimeLimit && displayTime < 600
    ? theme.palette.error.main
    : theme.palette.text.primary;

  const getQuizTitle = () => {
    if (quizType === 'challenge' && currentChallengeDetails) { return `Challenge: ${currentChallengeDetails.topic_name || currentChallengeDetails.topic_id?.replace(/-/g, ' ') || 'Quiz'}`; }
    if (effectiveSubject) { return `${effectiveSubject.charAt(0).toUpperCase() + effectiveSubject.slice(1)} Quiz`; }
    return 'Quiz';
  };

  const getQuizSubHeader = () => {
    let subHeaderParts = [];
    if (quizType !== 'challenge') { subHeaderParts.push(`Topic: ${effectiveTopicName}`); }
    else if (currentChallengeDetails) {
      const challengedByText = currentChallengeDetails.challenger_id === currentUser?.id ? (currentChallengeDetails.challengedUsername ? `You challenged ${currentChallengeDetails.challengedUsername}` : 'Awaiting opponent') : (currentChallengeDetails.challengerUsername || 'A User');
      subHeaderParts.push(`Challenged by: ${challengedByText}`);
    }
    if (effectiveQuizClass) subHeaderParts.push(`(Class ${effectiveQuizClass})`);
    if (effectiveDifficulty) subHeaderParts.push(effectiveDifficulty.charAt(0).toUpperCase() + effectiveDifficulty.slice(1));
    if (questionsLength > 0) subHeaderParts.push(`${questionsLength} Questions`);
    return subHeaderParts.join(' ');
  };

  return (
    <>
      <Box sx={{
        position: 'fixed', top: { xs: `calc(56px + ${theme.spacing(1)})`, sm: `calc(64px + ${theme.spacing(1)})` },
        left: '50%', transform: 'translateX(-50%)', backgroundColor: alpha(theme.palette.background.paper, 0.95),
        color: timerDisplayTextColor, padding: theme.spacing(0.75, 2), borderRadius: theme.shape.borderRadius,
        zIndex: 1050, boxShadow: theme.shadows[3], minWidth: '100px', textAlign: 'center',
        border: `1px solid ${alpha(baseTimerColorForAlpha, 0.5)}`,
        display: (timerActive || elapsedTime > 0) && questionsLength > 0 ? 'block' : 'none'
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 500, lineHeight: 1.2, fontSize: '1rem' }}>
          {effectiveTimeLimit ? 'Time Left: ' : 'Time: '} {formatTime(displayTime)}
        </Typography>
      </Box>

      {infoMessage && <Alert severity="info" sx={{ my: 2, mt: 8 }}>{infoMessage}</Alert>}

      <Typography variant="h4" gutterBottom component="div" sx={{
        mb: 1, textAlign: 'center', color: effectiveAccentColor, fontWeight: 'bold',
        fontSize: { xs: '1.8rem', sm: '2.125rem' },
        mt: !infoMessage && ((timerActive || elapsedTime > 0) && questionsLength > 0) ? 8 : (timerActive || elapsedTime > 0 ? 1 : 4.5)
      }}>
        {getQuizTitle()}
      </Typography>
      <Typography variant="h6" component="div" sx={{
        mb: 2, textAlign: 'center', color: theme.palette.text.secondary, fontWeight: 'normal',
        textTransform: 'capitalize', fontSize: { xs: '1rem', sm: '1.125rem' }
      }}>
        {getQuizSubHeader()}
      </Typography>
      
      {onAbandon && (
          <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
              <Button onClick={onAbandon} variant="text" color="error" size="small" startIcon={<ReplayIcon/>}>
                  Abandon & Start Over
              </Button>
          </Box>
      )}

      {quizType === 'challenge' && currentChallengeDetails?.challenger_id !== currentUser?.id && currentChallengeDetails?.challenger_score !== null && (
          <Alert severity="info" sx={{mb: 2}}>
              Your opponent {currentChallengeDetails.challengerUsername || 'has'} already completed this challenge, scoring {currentChallengeDetails.challenger_score}/{currentChallengeDetails.num_questions}. Good luck!
          </Alert>
      )}
    </>
  );
}

export default QuizHeader;