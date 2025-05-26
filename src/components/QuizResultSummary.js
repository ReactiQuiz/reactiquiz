// src/components/QuizResultSummary.js
import {
  Typography, Paper, Divider, Alert, Chip, Box, useTheme
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import { formatTime } from '../utils/formatTime'; // Assuming utils is at src/utils

const formatTopicName = (topicId) => {
  if (!topicId) return 'N/A';
  let name = topicId.replace(/-/g, ' ');
  const classSuffixRegex = /\s(\d+(?:st|nd|rd|th))$/i;
  name = name.replace(classSuffixRegex, '').trim();
  return name.replace(/\b\w/g, l => l.toUpperCase());
};

function QuizResultSummary({ quizResult, quizTitle, accentColor }) {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  const { topicId, score, totalQuestions, percentage, difficulty, numQuestionsConfigured, class: quizClassFromResult, timeTaken } = quizResult || {};
  const topicName = formatTopicName(topicId);

  if (!quizResult) {
    return <Typography>Loading summary...</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, textAlign: 'center', borderTop: `5px solid ${effectiveAccentColor}` }}>
      <Typography variant="h3" gutterBottom sx={{ color: effectiveAccentColor, fontWeight: 'bold' }}>
        {quizTitle || "Quiz Results"}
      </Typography>
      <Typography variant="h5" component="div" gutterBottom>
        <Typography variant="h6" component="span" sx={{ textTransform: 'capitalize', color: theme.palette.text.secondary }}>
          {topicName}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 0.5, mb: 1 }}>
          {quizClassFromResult && <Chip label={`Class ${quizClassFromResult}`} size="small" variant="outlined" />}
          {difficulty && <Chip label={difficulty} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />}
          {(numQuestionsConfigured != null && numQuestionsConfigured > 0) && <Chip label={`${numQuestionsConfigured} Qs Config.`} size="small" variant="outlined" />}
          {timeTaken != null && <Chip icon={<TimerIcon fontSize="small" />} label={formatTime(timeTaken)} size="small" variant="outlined" />}
        </Box>
        <Divider sx={{ my: 1.5 }} />
        Score:
        <Typography component="span" variant="h4" sx={{ color: effectiveAccentColor, fontWeight: 'bold', ml: 1 }}>
          {score} / {totalQuestions}
        </Typography>
        <Typography component="span" variant="h5" sx={{ color: effectiveAccentColor, ml: 0.5 }}>
          ({percentage}%)
        </Typography>
      </Typography>
      {percentage === 100 && <Alert severity="success" variant="filled" sx={{ mt: 2 }}>Excellent! You got all questions correct!</Alert>}
      {percentage >= 70 && percentage < 100 && <Alert severity="info" variant="filled" sx={{ mt: 2 }}>Great job! You have a good understanding.</Alert>}
      {percentage >= 50 && percentage < 70 && <Alert severity="warning" variant="filled" sx={{ mt: 2 }}>Not bad! Review the incorrect answers to improve.</Alert>}
      {percentage < 50 && <Alert severity="error" variant="filled" sx={{ mt: 2 }}>Keep practicing! Review the explanations to learn more.</Alert>}
    </Paper>
  );
}

export default QuizResultSummary;