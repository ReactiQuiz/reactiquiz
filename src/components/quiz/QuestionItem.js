// src/components/quiz/QuestionItem.js
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import MarkdownRenderer from '../shared/MarkdownRenderer'; // <-- IMPORT

const QuestionItem = ({ question, questionNumber, onOptionSelect, selectedOptionId, accentColor }) => {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3, width: '100%', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom component="div" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
        Question {questionNumber}:
      </Typography>

      {/* --- START OF FIX --- */}
      <Box sx={{ mb: 2.5, color: theme.palette.text.primary, fontSize: '1.1rem' }}>
        <MarkdownRenderer text={question.text} />
      </Box>
      {/* --- END OF FIX --- */}

      <Box display="flex" flexDirection="column" gap={1.5}>
        {question.options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          return (
            <Button
              key={option.id}
              variant={isSelected ? "contained" : "outlined"}
              fullWidth
              onClick={() => onOptionSelect(question.id, option.id)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1.5,
                px: 2,
                borderRadius: '8px',
                borderColor: alpha(effectiveAccentColor, 0.5),
                color: isSelected
                  ? theme.palette.getContrastText(effectiveAccentColor)
                  : theme.palette.text.primary,
                backgroundColor: isSelected
                  ? effectiveAccentColor
                  : 'transparent',
                '&:hover': {
                  borderColor: effectiveAccentColor,
                  backgroundColor: isSelected
                    ? darken(effectiveAccentColor, 0.15)
                    : alpha(effectiveAccentColor, 0.08),
                },
                textTransform: 'none',
                fontSize: '1rem',
                lineHeight: 1.5,
                fontWeight: isSelected ? 500 : 400,
              }}
            >
              {/* Also render options with the renderer */}
              <MarkdownRenderer text={option.text} />
            </Button>
          );
        })}
      </Box>
    </Paper>
  );
};

export default QuestionItem;