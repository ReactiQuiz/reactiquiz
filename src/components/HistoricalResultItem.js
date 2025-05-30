// src/components/HistoricalResultItem.js
import {
  Paper, ListItem, Box, Typography, Chip, IconButton, useTheme, alpha
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import TimerIcon from '@mui/icons-material/Timer';
import { formatTime } from '../utils/formatTime';
import { subjectAccentColors } from '../theme';

// Ensure this function handles various topicId formats gracefully
const formatTopicName = (topicId) => {
  if (!topicId) return 'N/A';
  let name = String(topicId).replace(/-/g, ' '); // Ensure topicId is a string
  
  // Remove specific prefixes if they exist
  name = name.replace(/^homibhabha practice /i, 'Homi Bhabha Practice - ');
  name = name.replace(/^pyq /i, 'PYQ ');

  const classSuffixRegex = /\s(\d+(?:st|nd|rd|th))$/i;
  name = name.replace(classSuffixRegex, (match, p1) => ` - Class ${p1.toUpperCase()}`).trim(); // Add "Class" prefix
  
  // Capitalize words, handle hyphens introduced by replacements
  name = name.split(' ').map(word => {
      if (word.toLowerCase() === 'class' || word.toLowerCase() === 'std') return word; // Keep 'Class' as is
      if (word.includes('-')) { // Handle parts like "9th-2023"
          return word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-');
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');

  // Specific formatting for Homi Bhabha practice test if it has difficulty
  name = name.replace(/Homi Bhabha Practice - (\w+) (\w+)/i, (match, quizClass, difficulty) => 
    `Homi Bhabha Practice - Std ${quizClass} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`
  );
   name = name.replace(/Pyq (\w+) (\d+)/i, (match, quizClass, year) => 
    `PYQ - Std ${quizClass} (${year})`
  );


  return name;
};


function HistoricalResultItem({ result, onResultClick, onDeleteClick, showDeleteButton }) {
  const theme = useTheme();

  if (!result) { // Guard against undefined result
    return null;
  }

  const topicName = formatTopicName(result.topicId);
  const itemAccentColor = subjectAccentColors[result.subject?.toLowerCase()] || theme.palette.grey[700];

  return (
    <Paper
      onClick={() => onResultClick(result)}
      sx={{
        width: '100%', textAlign: 'left', display: 'block', mb: 2, borderRadius: 2, overflow: 'hidden',
        borderLeft: `5px solid ${itemAccentColor}`,
        cursor: 'pointer',
        '&:hover': { boxShadow: theme.shadows[6], backgroundColor: alpha(theme.palette.action.hover, 0.08) },
        p: 0
      }}
      elevation={2}
    >
      <ListItem sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', sm: { alignItems: 'center' }, gap: { xs: 1, sm: 2 }, py: 1.5, px: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ textTransform: 'capitalize', fontWeight: 500, color: itemAccentColor }}>
            {topicName} {/* Use formatted name */}
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
          {showDeleteButton && onDeleteClick && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(result.id);
              }}
              sx={{ color: theme.palette.error.light, '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.2) } }}
              aria-label={`Delete result for ${topicName}`}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </ListItem>
    </Paper>
  );
}

export default HistoricalResultItem;