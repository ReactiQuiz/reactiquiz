import React from 'react';
import { Box, Typography } from '@mui/material';

function ResultsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Quiz Results</Typography>
      <Typography>
        Your quiz scores and performance will be displayed here after you complete a quiz.
      </Typography>
    </Box>
  );
}

export default ResultsPage;