// src/components/quiz/QuizHeader.tsx
/**
 * Quiz Header Component
 * 
 * This component displays the quiz header with topic information,
 * timer, and abandon quiz button. It shows quiz metadata and time
 * remaining or elapsed time.
 */
import React from 'react';
import { Box, Typography, useTheme, alpha, Button } from '@mui/material';
// import { formatTime } from '../../utils/formatTime';
import ReplayIcon from '@mui/icons-material/Replay';

/**
 * QuizHeaderProps Interface
 * 
 * Props for the QuizHeader component.
 */
interface QuizHeaderProps {
  topicName: string; // Name of the quiz topic
  subject: string; // Subject of the quiz
  difficulty: string; // Difficulty level (easy, medium, hard, mixed)
  timeLimit: number; // Time limit in seconds (0 if no limit)
  elapsedTime: number; // Elapsed time in seconds
  timerActive: boolean; // Whether the timer is active
  accentColor: string; // Accent color for styling
  onAbandonQuiz: () => void; // Callback to abandon/exit quiz
}

/**
 * Quiz Header Component
 * 
 * Displays the quiz header with:
 * - Topic name and subject information
 * - Difficulty level
 * - Timer (countdown or elapsed time)
 * - Abandon quiz button
 * 
 * The timer changes color to red when time is running low (< 10 minutes).
 * Shows countdown if timeLimit > 0, otherwise shows elapsed time.
 * 
 * @param {QuizHeaderProps} props - Component props
 * @returns {JSX.Element} Quiz header with topic info and timer
 */
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
  // Get theme for styling
  const theme = useTheme();
  // Use accent color or default to primary theme color
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  /**
   * Display Time Calculation
   * 
   * Calculates the time to display:
   * - If timeLimit > 0: Shows countdown (timeLimit - elapsedTime)
   * - If timeLimit = 0: Shows elapsed time
   * When countdown hits 0, header will show 00:00
   */
  const displayTime = timeLimit ? Math.max(0, timeLimit - elapsedTime) : elapsedTime;
  
  /**
   * Format Quiz Clock
   * 
   * Formats seconds into MM:SS format for display.
   * 
   * @param {number} totalSeconds - Total seconds to format
   * @returns {string} Formatted time string (MM : SS)
   */
  const formatQuizClock = (totalSeconds: number): string => {
    if (totalSeconds == null || isNaN(totalSeconds) || totalSeconds < 0) return '0 : 00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} : ${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Timer Color
   * 
   * Determines timer color based on remaining time:
   * - Red if time limit exists and less than 10 minutes remain
   * - Default text color otherwise
   */
  const baseTimerColorForAlpha = timeLimit && displayTime < 600
    ? theme.palette.error.main // Red when time is running low
    : theme.palette.text.primary; // Default text color

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