import React from 'react';
import { Box, Typography } from '@mui/material';

function PhysicsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Physics Quiz Section</Typography> {/* Corrected: removed \ */}
      <Typography>
        Explore the world of Physics! Quizzes on mechanics, thermodynamics, electromagnetism, and optics await.
      </Typography>
    </Box>
  );
}

export default PhysicsPage;