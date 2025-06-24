// src/components/dashboard/OverallStatsCards.js
import React from 'react';
import { Paper, Grid, Typography, Box, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

function OverallStatsCards({ totalQuizzes, averageScore, accentColor }) {
  const theme = useTheme();
  const effectiveAccentColor = accentColor || theme.palette.grey[700];

  return (
    // This outer Paper is just a container for the Grid, helps with overall spacing/background
    <Paper elevation={0} sx={{ p: {xs: 0, sm: 0}, mb: 3, backgroundColor: 'transparent'}}> {/* Changed to transparent, padding to 0 */}
      <Grid container> {/* spacing between the two cards */}
        {/* Card 1: Total Quizzes Solved */}
        <Grid width='49.5%'> {/* Takes full width on xs, half width on sm and up */}
          <Paper sx={{ p: {xs: 2, sm: 2.5}, textAlign: 'center', height: '100%', borderTop: `4px solid ${effectiveAccentColor}` }}>
            <Typography variant="h6" color="text.secondary" sx={{fontSize: {xs: '1rem', sm: '1.125rem'}}}>Total Quizzes Solved</Typography>
            <Typography variant="h3" sx={{ color: effectiveAccentColor, fontWeight: 'bold', fontSize: {xs: '2rem', sm: '2.5rem'} }}>
              {totalQuizzes}
            </Typography>
            <Typography variant="caption" color="text.secondary">(in selected period)</Typography>
          </Paper>
        </Grid>

        <Grid width='1%'>

        </Grid>

        {/* Card 2: Overall Average Score */}
        <Grid width='49.5%'> {/* Takes full width on xs, half width on sm and up */}
          <Paper sx={{ p: {xs:2, sm:2.5}, textAlign: 'center', height: '100%', borderTop: `4px solid ${effectiveAccentColor}` }}>
            <Typography variant="h6" color="text.secondary" sx={{fontSize: {xs: '1rem', sm: '1.125rem'}}}>Overall Average Score</Typography>
            <Typography variant="h3" sx={{ color: effectiveAccentColor, fontWeight: 'bold', fontSize: {xs: '2rem', sm: '2.5rem'} }}>
              {averageScore}%
            </Typography>
            <Typography variant="caption" color="text.secondary">(in selected period)</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default OverallStatsCards;