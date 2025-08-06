// src/components/results/HistoricalResultItem.js
import { Paper, Box, Typography, Chip, useTheme, alpha, Stack, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';

function HistoricalResultItem({ result }) {
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
  
  const handleResultClick = () => {
    navigate(`/results/${result.id}`);
  };

  
  return (
    <Paper
      onClick={handleResultClick}
      sx={{
        p: isFeatured ? 3 : 2, // Larger padding for the featured card
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        borderLeft: `5px solid ${itemAccentColor}`,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[6] },
      }}
      elevation={isFeatured ? 6 : 3} // More shadow for the featured card
    >
      <Box sx={{ flexGrow: 1, mb: 1.5 }}>
        <Typography 
          variant={isFeatured ? "h5" : "h6"} // Larger title for featured card
          sx={{ fontWeight: 600, color: itemAccentColor, lineHeight: 1.3, mb: 1.5, textTransform: 'capitalize' }}
          title={result.topicName}
        >
          {result.topicName}
        </Typography>
        {/* --- START OF FIX: Add Class and Genre Chips --- */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {result.class && <Chip label={`Class ${result.class}`} size="small" />}
          {result.genre && <Chip label={result.genre} size="small" variant="outlined" />}
        </Stack>
        {/* --- END OF FIX --- */}
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