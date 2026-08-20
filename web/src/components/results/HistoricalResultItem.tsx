// src/components/results/HistoricalResultItem.tsx
/**
 * Historical Result Item Component
 * 
 * Premium card displaying individual quiz result history with subject accent styling,
 * score progress, metadata chips, and click navigation.
 */
import React from 'react';
import { Paper, Box, Typography, Chip, useTheme, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';
import ScoreRing from '../shared/ScoreRing';

function HistoricalResultItem({ result }: { result: any }) { 
  const theme = useTheme();
  const navigate = useNavigate();
  const { getColor } = useSubjectColors();

  if (!result) return null;

  const itemAccentColor = getColor(result.subject) || theme.palette.primary.main;
  const formattedDate = result.timestamp ? new Date(result.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'Recent';

  const handleResultClick = () => { navigate(`/results/${result.id}`); };

  return (
    <Paper
      onClick={handleResultClick}
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        borderRadius: 3,
        borderTop: `4px solid ${itemAccentColor}`,
        borderLeft: `1px solid ${theme.palette.divider}`,
        borderRight: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: theme => alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px -6px ${alpha(itemAccentColor, 0.25)}`,
          borderColor: alpha(itemAccentColor, 0.5),
          '& .arrow-icon': {
            transform: 'translateX(4px)',
            color: itemAccentColor,
          }
        },
      }}
    >
      <Box>
        {/* Header Badges */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1 }}>
          <Chip
            label={result.subject}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              bgcolor: alpha(itemAccentColor, 0.15),
              color: itemAccentColor,
              border: `1px solid ${alpha(itemAccentColor, 0.3)}`,
            }}
          />
          {result.class && (
            <Chip
              label={result.class}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem', fontWeight: 600, borderColor: theme.palette.divider }}
            />
          )}
        </Box>

        {/* Topic Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.1rem',
            lineHeight: 1.35,
            mb: 2,
            color: 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={result.topicName}
        >
          {result.topicName}
        </Typography>

        {/* Score Ring */}
        <Box sx={{ my: 1 }}>
          <ScoreRing
            percent={result.percentage}
            color={itemAccentColor}
            label={
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
                Score: {result.score}/{result.totalQuestions}
              </Typography>
            }
          />
        </Box>
      </Box>

      {/* Footer Details */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 1.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
          <CalendarTodayIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {formattedDate}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Details
          </Typography>
          <ArrowForwardIcon className="arrow-icon" sx={{ fontSize: 16, transition: 'transform 0.2s ease, color 0.2s ease' }} />
        </Stack>
      </Box>
    </Paper>
  );
}

export default HistoricalResultItem;