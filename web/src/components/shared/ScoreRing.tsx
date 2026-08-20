// src/components/shared/ScoreRing.tsx
/**
 * Linear Score Bar Component
 *
 * Converts circular progress displays into clean, modern linear bar indicators
 * with smooth fill animation, percentage labels, and theme-matched colors.
 */
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface ScoreRingProps {
  percent: number;
  size?: number;
  thickness?: number;
  label?: React.ReactNode;
  color?: string;
}

const ScoreRing: React.FC<ScoreRingProps> = ({ percent, color, label }) => {
  const theme = useTheme();
  const barColor = color || theme.palette.primary.main;
  const clampedPercent = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <Box sx={{ width: '100%', my: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {label}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: barColor }}>
          {clampedPercent}%
        </Typography>
      </Box>
      <Box
        sx={{
          height: 10,
          width: '100%',
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${clampedPercent}%`,
            bgcolor: barColor,
            borderRadius: 2,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </Box>
    </Box>
  );
};

export default ScoreRing;

