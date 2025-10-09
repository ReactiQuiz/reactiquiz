// src/components/quiz/QuizHeader.tsx
import React from 'react';
import { Box, Typography, useTheme, alpha, Button } from '@mui/material';
// import { formatTime } from '../../utils/formatTime';
import ReplayIcon from '@mui/icons-material/Replay';

interface QuizHeaderProps {
  topicName: string;
  subject: string;
  difficulty: string;
  timeLimit: number;
  elapsedTime: number;
  timerActive: boolean;
  accentColor: string;
  onAbandonQuiz: () => void;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
  topicName,
  subject,
  difficulty,
  timeLimit,
  elapsedTime,
  timerActive,
  accentColor,
  onAbandonQuiz
}) => {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  // timeLimit in seconds; when it hits 0, header will show 00:00
  const displayTime = timeLimit ? Math.max(0, timeLimit - elapsedTime) : elapsedTime;
  const formatQuizClock = (totalSeconds: number): string => {
    if (totalSeconds == null || isNaN(totalSeconds) || totalSeconds < 0) return '0 : 00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} : ${seconds.toString().padStart(2, '0')}`;
  };

  const baseTimerColorForAlpha = timeLimit && displayTime < 600
    ? theme.palette.error.main
    : theme.palette.text.primary;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: effectiveAccentColor }}>
            {topicName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {/* We now check if difficulty is a valid string before trying to format it. */}
            {subject}
            {difficulty && typeof difficulty === 'string'
              ? ` • ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`
              : ''}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {timerActive && (
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: alpha(baseTimerColorForAlpha, 0.1),
                border: `1px solid ${alpha(baseTimerColorForAlpha, 0.3)}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: baseTimerColorForAlpha,
                  fontFamily: 'monospace',
                }}
              >
                {formatQuizClock(displayTime)}
              </Typography>
            </Box>
          )}
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<ReplayIcon />}
            onClick={onAbandonQuiz}
            size="small"
          >
            Abandon
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default QuizHeader;