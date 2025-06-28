// src/components/dashboard/GenerateReportButton.js
import React from 'react';
import { Button, Box } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

function GenerateReportButton({ onGenerate, isLoading, accentColor }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
      <Button
        variant="contained"
        color="primary" // Or use accentColor logic
        startIcon={<PictureAsPdfIcon />}
        onClick={onGenerate}
        disabled={isLoading}
        sx={{
          backgroundColor: accentColor,
          '&:hover': {
            backgroundColor: theme => theme.palette.augmentColor({ color: { main: accentColor } }).dark
          },
          minWidth: '200px',
          py: 1.5
        }}
      >
        {isLoading ? 'Generating PDF...' : 'Download Report PDF'}
      </Button>
    </Box>
  );
}

export default GenerateReportButton;