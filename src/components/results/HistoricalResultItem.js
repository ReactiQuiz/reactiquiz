// src/components/results/HistoricalResultItem.js
import { Paper, Box, Typography, Chip, IconButton, useTheme, alpha, Stack, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import { useNavigate } from 'react-router-dom';
import { subjectAccentColors } from '../../theme';
import { formatDisplayTopicName } from '../../utils/quizUtils';

function HistoricalResultItem({ result, onDeleteClick, showDeleteButton, isChallengeResult }) {
  const theme = useTheme();
  const navigate = useNavigate();

  if (!result) {
    return null;
  }

  const topicName = formatDisplayTopicName(result.topicId, result.topicName, isChallengeResult, result);
  const itemAccentColor = subjectAccentColors[result.subject?.toLowerCase()] || theme.palette.grey[700];

  const handleResultClick = () => {
    if (result && result.id) {
      navigate(`/results/${result.id}`);
    }
  };

  // Helper function to get more vibrant chip styles
  const getVibrantChipStyles = (percentage) => {
    if (percentage >= 70) {
      return {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.getContrastText(theme.palette.success.main),
      };
    }
    if (percentage >= 50) {
      return {
        backgroundColor: theme.palette.warning.main,
        color: theme.palette.getContrastText(theme.palette.warning.main),
      };
    }
    return {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.getContrastText(theme.palette.error.main),
    };
  };

  return (
    <Paper
      onClick={handleResultClick}
      sx={{
        p: 1.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        borderLeft: `4px solid ${itemAccentColor}`,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: theme.shadows[5],
          backgroundColor: alpha(theme.palette.action.hover, 0.06)
        },
      }}
      elevation={2}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          {isChallengeResult && <SportsKabaddiIcon sx={{ color: itemAccentColor, fontSize: '1rem' }} />}
          <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 500, color: itemAccentColor, lineHeight: 1.2, flexGrow: 1 }}>
            {topicName}
          </Typography>
        </Stack>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, alignItems: 'center' }}>
          {result.class && <Chip label={`Class ${result.class}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: '18px' }} />}
          {result.difficulty && <Chip label={result.difficulty} size="small" variant="outlined" sx={{ textTransform: 'capitalize', fontSize: '0.7rem', height: '18px' }} />}
          {/* UPDATED: Date is now a chip */}
          <Chip label={new Date(result.timestamp).toLocaleDateString()} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: '18px' }}/>
        </Box>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* REMOVED: TimerIcon is gone */}
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {result.score}/{result.totalQuestions}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${result.percentage}%`}
            sx={{
              fontWeight: 'bold',
              fontSize: '0.9rem',
              height: '26px',
              ...getVibrantChipStyles(result.percentage) // UPDATED: More vibrant colors
            }}
          />
          {showDeleteButton && onDeleteClick && (
            <Tooltip title="Delete Result">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDeleteClick(result.id); }} sx={{ color: theme.palette.error.light, '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.2) } }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export default HistoricalResultItem;