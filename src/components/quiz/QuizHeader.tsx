// src/components/quiz/QuizHeader.tsx
import React from 'react';
import { Box, Typography, useTheme, alpha, Button } from '@mui/material';
import { formatTime } from '../../utils/formatTime';
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

  const displayTime = timeLimit ? Math.max(0, timeLimit - elapsedTime) : elapsedTime;

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
            {subject} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
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
                {formatTime(displayTime)}
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
