// src/components/dashboard/GenerateReportButton.js
import React from 'react';
import { Button, Box, useTheme } from '@mui/material'; // <-- Import useTheme
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { darken } from '@mui/material/styles'; // <-- Import darken utility

function GenerateReportButton({ onGenerate, isLoading }) { // <-- Removed accentColor prop
  const theme = useTheme();

  // --- START OF FIX: Use a default primary color and the darken utility ---
  const buttonColor = theme.palette.primary.main;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
      <Button
        variant="contained"
        startIcon={<PictureAsPdfIcon />}
        onClick={onGenerate}
        disabled={isLoading}
        sx={{
          backgroundColor: buttonColor,
          '&:hover': {
            backgroundColor: darken(buttonColor, 0.2) // Use the robust darken utility
          },
          minWidth: '200px',
          py: 1.5
        }}
      >
        {isLoading ? 'Generating PDF...' : 'Download Report PDF'}
      </Button>
    </Box>
  );
  // --- END OF FIX ---
}

export default GenerateReportButton;