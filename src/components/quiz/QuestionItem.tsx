// src/components/quiz/QuestionItem.tsx
import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import { Question } from '../../types';

interface QuestionItemProps {
  question: Question;
  questionNumber: number;
  onOptionSelect: (questionId: string, optionIndex: number) => void;
  selectedOptionId: number | undefined;
  accentColor: string;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ 
  question, 
  questionNumber, 
  onOptionSelect, 
  selectedOptionId, 
  accentColor 
}) => {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  // Pre-process the text to replace LaTeX newlines with standard newlines.
  const processedText = question.question_text ? question.question_text.replace(/\\newline/g, '\n') : '';

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
