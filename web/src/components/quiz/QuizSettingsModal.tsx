// src/components/quiz/QuizSettingsModal.tsx
/**
 * Quiz Settings Modal Component
 * 
 * This component displays a modal dialog for configuring quiz settings
 * before starting a quiz. It includes difficulty selection, time limit,
 * and number of questions configuration with validation.
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, useTheme, Box, Divider
} from '@mui/material';
import { darken } from '@mui/material/styles';
import { Topic } from '../../types';

/**
 * QuizSettingsModalProps Interface
 * 
 * Props for the QuizSettingsModal component.
 */
interface QuizSettingsModalProps {
  open: boolean; // Whether the modal is open
  onClose: () => void; // Callback to close the modal
  onStartQuiz: (settings: { timeLimit: number; numQuestions: number }) => void; // Callback to start quiz with settings
  topic: Topic | null; // Topic object for quiz (null if not topic-specific)
  accentColor: string; // Accent color for styling
}

/**
 * Quiz Settings Modal Component
 * 
 * Displays a modal dialog for configuring quiz settings. Features:
 * - Difficulty selection (easy, medium, hard, mixed)
 * - Time limit configuration (5-180 minutes)
 * - Number of questions configuration (1-50)
 * - Form validation with error messages
 * - Default settings reset when modal opens
 * 
 * This component is used when users start a quiz to configure
 * the quiz parameters before beginning.
 * 
 * @param {QuizSettingsModalProps} props - Component props
 * @returns {JSX.Element} Quiz settings modal dialog
 */
const QuizSettingsModal: React.FC<QuizSettingsModalProps> = ({ 
  open, 
  onClose, 
  onStartQuiz, 
  topic, 
  accentColor 
}) => {
  // Get theme for styling
  const theme = useTheme();
  // State for quiz settings
  const [timeLimit, setTimeLimit] = useState<number>(30); // Time limit in minutes
  const [numQuestions, setNumQuestions] = useState<number>(10);
  // State for validation errors
  const [timeLimitError, setTimeLimitError] = useState<string>('');
  const [numQuestionsError, setNumQuestionsError] = useState<string>('');
  
  // Use accent color or default to primary theme color
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  /**
   * Reset Settings Effect
   * 
   * Resets all settings to defaults when modal opens.
   * This ensures users always see default values when opening the modal.
   */
  useEffect(() => {
    if (open) {
      // Reset all settings to defaults
      setTimeLimit(30);
      setNumQuestions(10);
      // Clear error messages
      setTimeLimitError('');
      setNumQuestionsError('');
    }
  }, [open]);

  const handleTimeLimitChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    const maxTime = 180;
    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 5 && Number(value) <= maxTime)) {
      setTimeLimit(value === '' ? 0 : Number(value));
      setTimeLimitError('');
    } else {
      setTimeLimitError(`Time limit must be between 5 and ${maxTime} minutes`);
    }
  };

  const handleNumQuestionsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    const maxQuestions = 50;
    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= maxQuestions)) {
      setNumQuestions(value === '' ? 0 : Number(value));
      setNumQuestionsError('');
    } else {
      setNumQuestionsError(`Number of questions must be between 1 and ${maxQuestions}`);
    }
  };

  const handleSubmit = (): void => {
    if (timeLimit >= 5 && timeLimit <= 180 && numQuestions >= 1 && numQuestions <= 50) {
      onStartQuiz({ timeLimit, numQuestions });
    }
  };

  const isFormValid = timeLimit >= 5 && timeLimit <= 180 && numQuestions >= 1 && numQuestions <= 50;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '1.5rem', color: effectiveAccentColor }}>
          Quiz Settings
        </Box>
        {topic && (
          <Box sx={{ mt: 1, color: 'text.secondary' }}>
            {topic.name}
          </Box>
        )}
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Time Limit (minutes)"
            type="number"
            value={timeLimit}
            onChange={handleTimeLimitChange}
            error={!!timeLimitError}
            helperText={timeLimitError || 'Enter time limit between 5-180 minutes'}
            inputProps={{ min: 5, max: 180, step: 1 }}
          />

          <TextField
            fullWidth
            label="Number of Questions"
            type="number"
            value={numQuestions}
            onChange={handleNumQuestionsChange}
            error={!!numQuestionsError}
            helperText={numQuestionsError || 'Enter number of questions between 1-50'}
            inputProps={{ min: 1, max: 50 }}
          />
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ minWidth: 100 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid}
          sx={{
            backgroundColor: effectiveAccentColor,
            color: theme.palette.getContrastText(effectiveAccentColor),
            '&:hover': {
              backgroundColor: darken(effectiveAccentColor, 0.1),
            },
            minWidth: 120,
          }}
        >
          Start Quiz
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizSettingsModal;
