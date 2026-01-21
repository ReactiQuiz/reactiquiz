// src/components/results/HistoricalResultItem.tsx
/**
 * Historical Result Item Component
 * 
 * This component displays a single historical quiz result item
 * in a list. It shows result summary information with navigation
 * to the detailed result view.
 */
import { Paper, Box, Typography, Chip, useTheme, alpha, Stack, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';

/**
 * Historical Result Item Component
 * 
 * Displays a historical result item card with:
 * - Topic name with accent color
 * - Class and genre chips
 * - Score display with progress bar
 * - Percentage chip (color-coded: success/warning/error)
 * - Click navigation to detail view
 * - Hover animations
 * 
 * This component is used in HistoricalResultsList to display
 * individual quiz results in a grid/list.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.result - Quiz result object
 * @returns {JSX.Element} Historical result item card
 */
function HistoricalResultItem({ result }) { 
// --- END OF FIX ---
  const theme = useTheme();
  const navigate = useNavigate();
  const { getColor } = useSubjectColors();

  if (!result) return null;

  const itemAccentColor = getColor(result.subject);

  const getVibrantChipStyles = (percentage) => {
    if (percentage >= 70) return { backgroundColor: theme.palette.success.main };
    if (percentage >= 40) return { backgroundColor: theme.palette.warning.main };
    return { backgroundColor: theme.palette.error.main };
  };
  
  const handleResultClick = () => { navigate(`/results/${result.id}`); };

  return (
    <Paper
      onClick={handleResultClick}
      sx={{
        // --- START OF FIX: Removed conditional styling based on 'isFeatured' ---
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        borderLeft: `5px solid ${itemAccentColor}`,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[6] },
        // --- END OF FIX ---
      }}
      elevation={3}
    >
      <Box sx={{ flexGrow: 1, mb: 1.5 }}>
        <Typography 
          // --- START OF FIX: Removed conditional styling ---
          variant="h6"
          // --- END OF FIX ---
          sx={{ fontWeight: 600, color: itemAccentColor, lineHeight: 1.3, mb: 1.5, textTransform: 'capitalize' }}
          title={result.topicName}
        >
          {result.topicName}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {result.class && <Chip label={`Class ${result.class}`} size="small" />}
          {result.genre && <Chip label={result.genre} size="small" variant="outlined" />}
        </Stack>
      </Box>

      <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">Score</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {result.score}/{result.totalQuestions}
              </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={result.percentage}
              sx={{ height: 8, borderRadius: 4, flexGrow: 1, backgroundColor: alpha(itemAccentColor, 0.2), '& .MuiLinearProgress-bar': { backgroundColor: itemAccentColor } }}
            />
            <Chip
              label={`${result.percentage}%`}
              size="small"
              sx={{ fontWeight: 'bold', color: 'white', minWidth: '50px', ...getVibrantChipStyles(result.percentage) }}
            />
          </Box>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', textAlign: 'right' }}>
        {new Date(result.timestamp).toLocaleDateString()}
      </Typography>
    </Paper>
  );
}

export default HistoricalResultItem;