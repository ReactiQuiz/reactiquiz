import {
  Box, Typography, Button, Paper, useTheme
} from '@mui/material';
import {
  lighten, darken
} from '@mui/material/styles';

const QuestionItem = ({ question, questionNumber, onOptionSelect, selectedOptionId, accentColor }) => {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3, width: '100%' }}>
      <Typography variant="h6" gutterBottom component="div" sx={{ color: effectiveAccentColor, fontWeight: 500 }}>
        Question {questionNumber}:
      </Typography>
      <Typography variant="body1" sx={{ mb: 2.5, color: theme.palette.text.primary }}>
        {question.text}
      </Typography>
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
                borderColor: effectiveAccentColor,
                color: isSelected
                  ? theme.palette.getContrastText(effectiveAccentColor)
                  : effectiveAccentColor,
                backgroundColor: isSelected
                  ? effectiveAccentColor
                  : 'transparent',
                '&:hover': {
                  borderColor: effectiveAccentColor,
                  backgroundColor: isSelected
                    ? darken(effectiveAccentColor, 0.15)
                    : lighten(effectiveAccentColor, 0.9),
                },
                textTransform: 'none',
                fontSize: '1rem',
                lineHeight: 1.5,
                fontWeight: isSelected ? 500 : 400,
              }}
            >
              {option.text}
            </Button>
          );
        })}
      </Box>
    </Paper>
  );
};

export default QuestionItem;