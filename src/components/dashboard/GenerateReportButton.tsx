// src/components/dashboard/GenerateReportButton.js
import React from 'react';
import { Box, useTheme } from '@mui/material'; // <-- Import useTheme
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { darken } from '@mui/material/styles'; // <-- Import darken utility
import LiquidGlassButton from '../animations/LiquidGlassButton';

function GenerateReportButton({ onGenerate, isLoading }) { // <-- Removed accentColor prop
  const theme = useTheme();

  // --- START OF FIX: Use a default primary color and the darken utility ---
  const buttonColor = theme.palette.primary.main;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
      <LiquidGlassButton
        variant="primary"
        size="large"
        startIcon={<PictureAsPdfIcon />}
        onClick={onGenerate}
        disabled={isLoading}
        sx={{ minWidth: '220px' }}
      >
        {isLoading ? 'Generating PDF...' : 'Download Report PDF'}
      </LiquidGlassButton>
    </Box>
  );
  // --- END OF FIX ---
}

export default GenerateReportButton;