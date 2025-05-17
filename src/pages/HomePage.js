import React from 'react';
import { Box, Typography } from '@mui/material';

function HomePage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Welcome to ReactiQuiz!</Typography>
      <Typography>
        Please select a subject from the menu to start a quiz, or explore your results.
      </Typography>
    </Box>
  );
}

export default HomePage;