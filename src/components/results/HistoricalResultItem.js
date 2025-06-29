// src/components/results/HistoricalResultItem.js
import { Paper, ListItem, Box, Typography, Chip, IconButton, useTheme, alpha, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import TimerIcon from '@mui/icons-material/Timer';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import { useNavigate } from 'react-router-dom'; // <-- Import useNavigate
import { formatTime } from '../../utils/formatTime';
import { subjectAccentColors } from '../../theme';
import { formatDisplayTopicName } from '../../utils/quizUtils';

// --- FIX IS HERE ---
// The 'onResultClick' prop is completely removed from the function signature.
function HistoricalResultItem({ result, onDeleteClick, showDeleteButton, isChallengeResult }) {
  const theme = useTheme();
  const navigate = useNavigate(); // <-- Initialize the navigate function

  if (!result) {
    return null;
  }

  const topicName = formatDisplayTopicName(result.topicId, result.topicName, isChallengeResult, result);
  const itemAccentColor = subjectAccentColors[result.subject?.toLowerCase()] || theme.palette.grey[700];

  // This component now handles its own navigation logic.
  const handleResultClick = () => {
    if (result && result.id) {
      navigate(`/results/${result.id}`);
    }
  };

  return (
    // The onClick handler now calls the local handleResultClick function.
    <Paper
      onClick={handleResultClick}
      sx={{
        width: '100%', textAlign: 'left', display: 'block', mb: 1.5,
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
        borderLeft: `4px solid ${itemAccentColor}`,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: theme.shadows[4],
          backgroundColor: alpha(theme.palette.action.hover, 0.06)
        },
        p: 0
      }}
      elevation={1}
    >
      <ListItem sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 1.5 }, py: { xs: 1.5, sm: 1.5 }, px: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            {isChallengeResult && <SportsKabaddiIcon sx={{ color: itemAccentColor, fontSize: '1.1rem' }} />}
            <Typography variant="h6" component="div" sx={{ textTransform: 'capitalize', fontWeight: 500, color: itemAccentColor, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
              {topicName}
            </Typography>
          </Stack>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, alignItems: 'center' }}>
            <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Score: {result.score}/{result.totalQuestions}
            </Typography>
            {result.class && <Chip label={`Class ${result.class}`} size="small" sx={{ fontSize: '0.75rem', height: '20px' }} />}
            {result.difficulty && <Chip label={result.difficulty} size="small" sx={{ textTransform: 'capitalize', fontSize: '0.75rem', height: '20px' }} />}
            {(result.numQuestionsConfigured != null && result.numQuestionsConfigured > 0) && <Chip label={`${result.numQuestionsConfigured} Qs`} size="small" sx={{ fontSize: '0.75rem', height: '20px' }} />}
            {result.timeTaken != null && (<Chip icon={<TimerIcon sx={{ fontSize: '0.875rem' }} />} label={formatTime(result.timeTaken)} size="small" sx={{ fontSize: '0.75rem', height: '22px' }} />)}
          </Box>
          <Typography component="div" variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, mt: 0.5 }}>
            Taken on: {new Date(result.timestamp).toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, mt: { xs: 1, sm: 0 }, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
          <Chip
            label={`${result.percentage}%`}
            sx={{
              fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.05rem' }, px: { xs: 0.8, sm: 1 }, height: { xs: '28px', sm: '30px' },
              backgroundColor: result.percentage >= 70 ? alpha(theme.palette.success.dark, 0.3) : result.percentage >= 50 ? alpha(theme.palette.warning.dark, 0.3) : alpha(theme.palette.error.dark, 0.3),
              color: result.percentage >= 70 ? theme.palette.success.light : result.percentage >= 50 ? theme.palette.warning.light : theme.palette.error.light,
              border: `1px solid ${result.percentage >= 70 ? theme.palette.success.main : result.percentage >= 50 ? theme.palette.warning.main : theme.palette.error.main}`
            }}
          />
          {showDeleteButton && onDeleteClick && (
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDeleteClick(result.id); }}
              sx={{ color: theme.palette.error.light, '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.2) }, p: { xs: 0.5, sm: 0.75 } }}
              aria-label={`Delete result for ${topicName}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </ListItem>
    </Paper>
  );
}

export default HistoricalResultItem;