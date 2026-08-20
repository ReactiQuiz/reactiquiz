// src/components/quiz/QuestionItem.tsx
/**
 * Question Item Component
 * 
 * This component displays a single quiz question with its options.
 * It renders the question text (with markdown support) and multiple
 * choice options as buttons. Users can select an option by clicking.
 */
import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import { Question } from '../../types';

/**
 * QuestionItemProps Interface
 * 
 * Props for the QuestionItem component.
 */
interface QuestionItemProps {
  question: Question; // Question object with text and options
  questionNumber: number; // Question number (1-indexed)
  onOptionSelect: (questionId: string, optionIndex: number) => void; // Callback when option is selected
  selectedOptionId: number | undefined; // Currently selected option index
  accentColor: string; // Accent color for styling
}

/**
 * Question Item Component
 * 
 * Displays a single quiz question with:
 * - Question number and text
 * - Markdown rendering for question text (supports LaTeX)
 * - Multiple choice options as buttons
 * - Selected option highlighting
 * - Visual feedback on option selection
 * 
 * The question text supports markdown and LaTeX formatting.
 * Selected options are highlighted with the accent color.
 * 
 * @param {QuestionItemProps} props - Component props
 * @returns {JSX.Element} Question card with text and options
 */
const QuestionItem: React.FC<QuestionItemProps> = ({ 
  question, 
  questionNumber, 
  onOptionSelect, 
  selectedOptionId, 
  accentColor 
}) => {
  // Get theme for styling
  const theme = useTheme();
  // Use accent color or default to primary theme color
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  /**
   * Text Processing
   * 
   * Pre-processes the question text:
   * - Uses question_text if available, falls back to text property
   * - Replaces LaTeX newlines (\newline) with standard newlines
   * - Handles empty or missing text gracefully
   */
  const rawText = (question.question_text && question.question_text.trim().length > 0)
    ? question.question_text
    : (question as any).text || '';
  const processedText = rawText ? rawText.replace(/\\newline/g, '\n') : '';

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3, width: '100%', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom component="div" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
        Question {questionNumber}:
      </Typography>

      <Box sx={{ 
          mb: 2.5, 
          color: theme.palette.text.primary, 
          fontSize: '1.1rem',
          whiteSpace: 'pre-wrap'
      }}>
        <MarkdownRenderer text={processedText} />
      </Box>

      <Box display="flex" flexDirection="column" gap={1.5}>
        {question.options.map((option, index) => {
          const isSelected = index === selectedOptionId;
          return (
            <Button
              key={index}
              variant={isSelected ? "contained" : "outlined"}
              fullWidth
              onClick={() => onOptionSelect(question.id, index)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1.5,
                px: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: isSelected ? 600 : 400,
                backgroundColor: isSelected 
                  ? effectiveAccentColor 
                  : 'transparent',
                color: isSelected 
                  ? theme.palette.getContrastText(effectiveAccentColor)
                  : theme.palette.text.primary,
                borderColor: isSelected 
                  ? effectiveAccentColor 
                  : alpha(theme.palette.text.secondary, 0.3),
                '&:hover': {
                  backgroundColor: isSelected 
                    ? darken(effectiveAccentColor, 0.1)
                    : alpha(effectiveAccentColor, 0.1),
                  borderColor: effectiveAccentColor,
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: isSelected 
                      ? theme.palette.getContrastText(effectiveAccentColor)
                      : alpha(theme.palette.text.secondary, 0.3),
                    color: isSelected 
                      ? effectiveAccentColor
                      : theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    mr: 2,
                    flexShrink: 0,
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </Box>
                <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                  <MarkdownRenderer text={typeof option === 'string' ? option : option.text} />
                </Box>
              </Box>
            </Button>
          );
        })}
      </Box>
    </Paper>
  );
};

export default QuestionItem;
