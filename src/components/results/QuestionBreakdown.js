// src/components/results/QuestionBreakdown.js
import { Typography, Paper, List, ListItem, ListItemText, ListItemIcon, Divider, useTheme, alpha, Chip, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import MarkdownRenderer from '../shared/MarkdownRenderer';

function QuestionBreakdown({ detailedQuestions }) { // Renamed prop for clarity
  const theme = useTheme();
  const successColor = theme.palette.success.main;
  const errorColor = theme.palette.error.main;
  const neutralColor = theme.palette.grey[700];

  if (!detailedQuestions || detailedQuestions.length === 0) {
    return <Typography sx={{textAlign: 'center', my: 2}}>No question breakdown is available for this result.</Typography>;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Detailed Breakdown
      </Typography>
      {detailedQuestions.map((question, index) => (
        <Paper key={question.id || index} elevation={2} sx={{ mb: 3, p: { xs: 2, sm: 2.5 }, borderLeft: `4px solid ${question.isCorrect ? successColor : (question.isAnswered ? errorColor : neutralColor)}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}> Question {index + 1} </Typography>
            
            {/* --- START OF FIX: Use the isAnswered flag from the hook --- */}
            {question.isAnswered ? 
              (question.isCorrect ?
                <Chip icon={<CheckCircleOutlineIcon />} label="Correct" color="success" size="small" variant="outlined" /> :
                <Chip icon={<HighlightOffIcon />} label="Incorrect" color="error" size="small" variant="outlined" />
              ) : (
                <Chip label="Not Answered" size="small" variant="outlined" />
              )
            }
            {/* --- END OF FIX --- */}
          </Box>
          
          <Box sx={{ mb: 2 }}><MarkdownRenderer text={question.text} /></Box>
          
          {Array.isArray(question.options) && question.options.length > 0 && (
            <List dense sx={{ py: 0, mb: question.explanation ? 1.5 : 0 }}>
              {question.options.map(opt => {
                const isUserSelected = opt.id === question.userAnswerId;
                const isCorrectAnswer = opt.id === question.correctOptionId;
                let optionStyle = {};
                let icon = <RadioButtonUncheckedIcon fontSize="small" sx={{ color: theme.palette.action.disabled }} />;
                
                if (isCorrectAnswer) {
                  optionStyle = { backgroundColor: alpha(successColor, 0.2), border: `1px solid ${alpha(successColor, 0.4)}` };
                  icon = <CheckCircleOutlineIcon fontSize="small" sx={{ color: successColor }} />;
                }
                if (isUserSelected) {
                  icon = <RadioButtonCheckedIcon fontSize="small" sx={{ color: isCorrectAnswer ? successColor : errorColor }} />;
                  if (!isCorrectAnswer) {
                    optionStyle = { ...optionStyle, backgroundColor: alpha(errorColor, 0.2), border: `1px solid ${alpha(errorColor, 0.4)}` };
                  }
                }
                return (
                  <ListItem key={opt.id} sx={{ my: 0.5, borderRadius: 1, py: 1, px: 1.5, ...optionStyle }}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>{icon}</ListItemIcon>
                    <ListItemText primary={<MarkdownRenderer text={opt.text} />} />
                  </ListItem>
                );
              })}
            </List>
          )}

          {question.explanation && (
            <Paper elevation={0} sx={{ mt: 1.5, p: 1.5, backgroundColor: alpha(theme.palette.info.dark, 0.2), borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.info.light, fontWeight: 'bold', mb: 0.5 }}>Explanation:</Typography>
              <MarkdownRenderer text={question.explanation} />
            </Paper>
          )}
        </Paper>
      ))}
    </>
  );
}

export default QuestionBreakdown;