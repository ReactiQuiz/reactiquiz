import {
  Paper, ListItem, Box, Typography, Chip, IconButton, useTheme, alpha
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import TimerIcon from '@mui/icons-material/Timer';
import { formatTime } from '../utils/formatTime';
import { subjectAccentColors } from '../theme';

const formatTopicName = (topicId) => {
  if (!topicId) return 'N/A';
  let name = topicId.replace(/-/g, ' ');
  const classSuffixRegex = /\s(\d+(?:st|nd|rd|th))$/i;
  name = name.replace(classSuffixRegex, '').trim();
  return name.replace(/\b\w/g, l => l.toUpperCase());
};


function HistoricalResultItem({ result, onResultClick, onDeleteClick }) {
  const theme = useTheme();

  return (
    <Paper
      onClick={() => onResultClick(result)}
      sx={{
        width: '100%', textAlign: 'left', display: 'block', mb: 2, borderRadius: 2, overflow: 'hidden',
        borderLeft: `5px solid ${subjectAccentColors[result.subject?.toLowerCase()] || theme.palette.grey[500]}`,
        cursor: 'pointer',
        '&:hover': { boxShadow: theme.shadows[6], backgroundColor: alpha(theme.palette.action.hover, 0.08) },
        p: 0
      }}
      elevation={2}
    >
      <ListItem sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', sm: { alignItems: 'center' }, gap: { xs: 1, sm: 2 }, py: 1.5, px: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ textTransform: 'capitalize', fontWeight: 500, color: subjectAccentColors[result.subject?.toLowerCase()] || theme.palette.primary.light }}>
            {formatTopicName(result.topicId)}
          </Typography>
          <Typography component="div" variant="body2" color="text.secondary">
            Score: {result.score}/{result.totalQuestions}
            {result.class && <Chip label={`Class ${result.class}`} size="small" sx={{ ml: 1, backgroundColor: alpha(theme.palette.text.secondary, 0.3), color: theme.palette.text.primary, textTransform: 'capitalize' }} />}
            {result.difficulty && <Chip label={result.difficulty} size="small" sx={{ ml: 1, textTransform: 'capitalize', backgroundColor: alpha(theme.palette.info.dark, 0.3) }} />}
            {(result.numQuestionsConfigured != null && result.numQuestionsConfigured > 0) && <Chip label={`${result.numQuestionsConfigured} Qs`} size="small" sx={{ ml: 1, backgroundColor: alpha(theme.palette.secondary.dark, 0.3) }} />}
            {result.timeTaken != null && (
              <Chip
                icon={<TimerIcon fontSize="small" />}
                label={formatTime(result.timeTaken)}
                size="small"
                sx={{ ml: 1, backgroundColor: alpha(theme.palette.grey[700], 0.3) }}
              />
            )}
          </Typography>
          <Typography component="div" variant="caption" color="text.secondary">
            Taken on: {new Date(result.timestamp).toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 1, sm: 0 }, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
          <Chip
            label={`${result.percentage}%`}
            sx={{
              fontWeight: 'bold', fontSize: '1.1rem', px: 1,
              backgroundColor: result.percentage >= 70 ? alpha(theme.palette.success.dark, 0.3) : result.percentage >= 50 ? alpha(theme.palette.warning.dark, 0.3) : alpha(theme.palette.error.dark, 0.3),
              color: result.percentage >= 70 ? theme.palette.success.light : result.percentage >= 50 ? theme.palette.warning.light : theme.palette.error.light,
              border: `1px solid ${result.percentage >= 70 ? theme.palette.success.main : result.percentage >= 50 ? theme.palette.warning.main : theme.palette.error.main}`
            }}
          />
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(result.id);
            }}
            sx={{ color: theme.palette.error.light, '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.2) } }}
            aria-label={`Delete result for ${formatTopicName(result.topicId)}`}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </ListItem>
    </Paper>
  );
}

export default HistoricalResultItem;