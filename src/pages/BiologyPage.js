import React from 'react';
import { Box, Typography } from '@mui/material';

function BiologyPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Biology Quiz Section</Typography> {/* Corrected: removed \ */}
      <Typography>
        Dive into the study of life! Quizzes on cells, genetics, evolution, and ecosystems.
      </Typography>
    </Box>
  );
}

export default BiologyPage;
