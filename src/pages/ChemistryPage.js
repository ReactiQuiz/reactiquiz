import React from 'react';
import { Box, Typography } from '@mui/material';

function ChemistryPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Chemistry Quiz Section</Typography> {/* Corrected: removed \ */}
      <Typography>
        Welcome to the Chemistry quiz! Test your knowledge on elements, compounds, reactions, and more.
      </Typography>
    </Box>
  );
}

export default ChemistryPage;