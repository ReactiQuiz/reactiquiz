import React from 'react';
import { Box, Typography } from '@mui/material';

function MathematicsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Mathematics Quiz Section</Typography> {/* Corrected: removed \ */}
      <Typography>
        Challenge your mathematical skills! Solve problems in algebra, geometry, calculus, and statistics.
      </Typography>
    </Box>
  );
}

export default MathematicsPage;