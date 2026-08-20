// src/components/results/QuizResultSummary.tsx
/**
 * Quiz Result Summary Component
 * 
 * Displays animated score progress, topic title, subject/class chips, and time taken.
 */
import React, { useState, useEffect } from 'react';
import { Typography, Paper, Divider, Chip, Box, useTheme, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ScoreRing from '../shared/ScoreRing';
import { formatTime } from '../../utils/formatTime';

function QuizResultSummary({ quizResult, quizTitle, accentColor }: any) {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.primary.main;

  const {
    topicName, score, totalQuestions, percentage,
    class: quizClassFromResult, subject, timeTaken, timestamp
  } = quizResult || {};

  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    if (score === undefined || percentage === undefined) return;
    
    const scoreTarget = Math.max(0, score);
    const percentageTarget = Math.max(0, Math.min(100, percentage));
    const animationDuration = 1000;

    let startTime: number | null = null;
    let rafId: number | null = null;

    const step = (now: number) => {
      if (!startTime) startTime = now;
      const progress = Math.min((now - startTime) / animationDuration, 1);
      setAnimatedScore(Math.floor(progress * scoreTarget));
      setAnimatedPercentage(Math.floor(progress * percentageTarget));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setAnimatedScore(scoreTarget);
        setAnimatedPercentage(percentageTarget);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [score, percentage]);

  if (!quizResult) {
    return <Typography sx={{ p: 3, textAlign: 'center' }}>Loading summary...</Typography>;
  }

  const titleToDisplay = quizTitle || topicName || "Quiz Performance";
  const formattedDate = timestamp ? new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        mb: 4,
        borderRadius: 3,
        textAlign: 'center',
        borderTop: `4px solid ${effectiveAccentColor}`,
        borderLeft: `1px solid ${theme.palette.divider}`,
        borderRight: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: theme => alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        boxShadow: `0 8px 24px -6px ${alpha(effectiveAccentColor, 0.15)}`,
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '1.6rem', sm: '2.1rem' },
          color: 'text.primary',
          mb: 1.5,
          lineHeight: 1.3
        }}
      >
        {titleToDisplay}
      </Typography>

      {/* Metadata Chips */}
      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" flexWrap="wrap" sx={{ gap: 1, mb: 3 }}>
        {subject && (
          <Chip
            label={subject}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              bgcolor: alpha(effectiveAccentColor, 0.15),
              color: effectiveAccentColor,
              border: `1px solid ${alpha(effectiveAccentColor, 0.3)}`,
            }}
          />
        )}
        {quizClassFromResult && (
          <Chip
            label={quizClassFromResult}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, borderColor: theme.palette.divider }}
          />
        )}
        {totalQuestions > 0 && (
          <Chip
            icon={<HelpOutlineIcon sx={{ fontSize: 16 }} />}
            label={`${totalQuestions} Questions`}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, borderColor: theme.palette.divider }}
          />
        )}
        {timeTaken != null && timeTaken > 0 && (
          <Chip
            icon={<TimerIcon sx={{ fontSize: 16 }} />}
            label={formatTime(timeTaken)}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, borderColor: theme.palette.divider }}
          />
        )}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Score Ring Display */}
      <Box sx={{ my: 2, maxWidth: 450, mx: 'auto' }}>
        <ScoreRing
          percent={animatedPercentage}
          color={effectiveAccentColor}
          label={
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                Overall Score: {animatedScore} / {totalQuestions || 0} correct
                {percentage >= 90 && <EmojiEventsIcon sx={{ color: theme.palette.warning.main, fontSize: '1.5rem' }} />}
              </Typography>
              {formattedDate && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Completed on {formattedDate}
                </Typography>
              )}
            </Box>
          }
        />
      </Box>
    </Paper>
  );
}

export default QuizResultSummary;