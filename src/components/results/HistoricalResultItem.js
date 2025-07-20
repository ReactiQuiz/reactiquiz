// src/components/results/HistoricalResultItem.js
import { Paper, Box, Typography, Chip, useTheme, alpha, Stack, LinearProgress } from '@mui/material';
import { subjectAccentColors } from '../../theme';

function HistoricalResultItem({ result }) {
  const theme = useTheme();

  if (!result) return null;

  const itemAccentColor = subjectAccentColors[result.subject?.toLowerCase()] || theme.palette.grey[700];

  const getVibrantChipStyles = (percentage) => {
    if (percentage >= 70) return { backgroundColor: theme.palette.success.main };
    if (percentage >= 40) return { backgroundColor: theme.palette.warning.main };
    return { backgroundColor: theme.palette.error.main };
  };

  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        borderLeft: `5px solid ${itemAccentColor}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[6],
        },
      }}
      elevation={3}
    >
      <Box sx={{ flexGrow: 1, mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: itemAccentColor, lineHeight: 1.3, mb: 1 }}>
          {result.topicId.replace(/-/g, ' ')}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {result.class && <Chip label={`Class ${result.class}`} size="small" variant="outlined" />}
          {result.difficulty && <Chip label={result.difficulty} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />}
        </Stack>
      </Box>

      <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">Score</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {result.score}/{result.totalQuestions}
              </Typography>
          </Box>
          <Box>
            <LinearProgress
              variant="determinate"
              value={result.percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(itemAccentColor, 0.2),
                '& .MuiLinearProgress-bar': { backgroundColor: itemAccentColor }
              }}
            />
          </Box>
          <Chip
            label={`${result.percentage}%`}
            size="small"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              alignSelf: 'flex-end',
              ...getVibrantChipStyles(result.percentage)
            }}
          />
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', textAlign: 'right' }}>
        {new Date(result.timestamp).toLocaleDateString()}
      </Typography>
    </Paper>
  );
}

export default HistoricalResultItem;