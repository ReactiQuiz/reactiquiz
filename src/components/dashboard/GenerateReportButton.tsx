// src/components/dashboard/GenerateReportButton.js
import React from 'react';
import { Box, useTheme, Button } from '@mui/material'; // <-- Import useTheme
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
function GenerateReportButton({ onGenerate, isLoading }) { // <-- Removed accentColor prop
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<PictureAsPdfIcon />}
        onClick={onGenerate}
        disabled={isLoading}
        sx={{ minWidth: '220px' }}
      >
        {isLoading ? 'Generating PDF...' : 'Download Report PDF'}
      </Button>
    </Box>
  );
  // --- END OF FIX ---
}

export default GenerateReportButton;