// src/components/QuestionBreakdown.js
import {
  Typography, Paper, List, ListItem, ListItemText, ListItemIcon, Divider, useTheme, alpha, Chip, Box
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

function QuestionBreakdown({ detailedQuestionsToDisplay }) {
  const theme = useTheme();
  const successColor = theme.palette.success.main;
  const errorColor = theme.palette.error.main;
  const neutralColor = theme.palette.grey[700];

  if (!detailedQuestionsToDisplay || detailedQuestionsToDisplay.length === 0) {
    return <Typography sx={{textAlign: 'center', my: 2}}>No question breakdown available for this result.</Typography>;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', color: theme.palette.text.primary }}>
        Detailed Breakdown
      </Typography>
      {detailedQuestionsToDisplay.map((result, index) => (
        <Paper key={result.id || `q-${index}`} elevation={2} sx={{ mb: 3, p: { xs: 2, sm: 2.5 }, borderLeft: `4px solid ${result.isCorrect ? successColor : (result.isAnswered ? errorColor : neutralColor)}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 500, color: theme.palette.text.primary }}> Question {index + 1} </Typography>
            {result.isAnswered ? (result.isCorrect ?
              <Chip icon={<CheckCircleOutlineIcon />} label="Correct" color="success" size="small" variant="outlined" /> :
              <Chip icon={<HighlightOffIcon />} label="Incorrect" color="error" size="small" variant="outlined" />
            ) : (<Chip label="Not Answered" size="small" variant="outlined" />)}
          </Box>
          <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.primary, whiteSpace: 'pre-wrap' }}>{result.text}</Typography>
          <List dense sx={{ py: 0, mb: result.explanation ? 1.5 : 0 }}>
            {(result.options || []).map(opt => {
              const isUserSelected = opt.id === result.userAnswerId;
              const isCorrectAnswer = opt.id === result.correctOptionId;
              let optionStyle = {};
              let icon = <RadioButtonUncheckedIcon fontSize="small" sx={{ color: theme.palette.action.disabled }} />;
              if (isCorrectAnswer) {
                optionStyle = { backgroundColor: alpha(successColor, 0.2), border: `1px solid ${alpha(successColor, 0.4)}`, color: theme.palette.success.light };
                icon = <CheckCircleOutlineIcon fontSize="small" sx={{ color: successColor }} />;
              }
              if (isUserSelected) {
                icon = <RadioButtonCheckedIcon fontSize="small" sx={{ color: isCorrectAnswer ? successColor : errorColor }} />;
                if (!isCorrectAnswer) {
                  optionStyle = { ...optionStyle, backgroundColor: alpha(errorColor, 0.2), border: `1px solid ${alpha(errorColor, 0.4)}`, color: theme.palette.error.light };
                } else { optionStyle.fontWeight = 'bold'; }
              }
              return (
                <ListItem key={opt.id} sx={{ my: 0.5, borderRadius: theme.shape.borderRadius, py: 1, px: 1.5, border: `1px solid ${theme.palette.divider}`, transition: 'background-color 0.2s, border-color 0.2s', ...optionStyle }} >
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, alignItems: 'center' }}>{icon}</ListItemIcon>
                  <ListItemText primary={opt.text} primaryTypographyProps={{ variant: 'body1', fontWeight: isUserSelected ? 'bold' : 'normal', color: optionStyle.color || theme.palette.text.primary, whiteSpace: 'pre-wrap' }} />
                </ListItem>
              );
            })}
          </List>
          {result.explanation && (
            <Paper elevation={0} sx={{ mt: 1.5, p: 1.5, backgroundColor: alpha(theme.palette.info.dark, 0.2), borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.info.light, fontWeight: 'bold', mb: 0.5 }}>Explanation:</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{result.explanation}</Typography>
            </Paper>
          )}
          <Divider sx={{ mt: 2, display: index === detailedQuestionsToDisplay.length - 1 ? 'none' : 'block' }} />
        </Paper>
      ))}
    </>
  );
}

export default QuestionBreakdown;