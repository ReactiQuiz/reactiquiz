// src/components/challenges/RecentAttemptsForChallenge.js
import React, { useState } from 'react';
import { Box, Typography, List, Button, CircularProgress, Alert, useTheme } from '@mui/material';
import HistoricalResultItem from '../results/HistoricalResultItem'; // Adjust path as needed

function RecentAttemptsForChallenge({
  results,
  isLoading,
  error,
  onInitiateChallenge,
  accentColor
}) {
  const theme = useTheme();
  const [showAll, setShowAll] = useState(false);
  const MAX_INITIAL_DISPLAY = 3;
  const effectiveAccentColor = accentColor || theme.palette.secondary.main;

  if (isLoading) {
    return <CircularProgress sx={{ color: effectiveAccentColor, display: 'block', mx: 'auto', my: 2 }} />;
  }

  if (error) {
    return <Alert severity="warning" sx={{my: 2}}>{error}</Alert>;
  }

  if (results.length === 0) {
    return <Typography color="text.secondary" sx={{my: 2}}>No recent quiz attempts found to use for challenges.</Typography>;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ color: effectiveAccentColor, opacity: 0.85 }}>
        Initiate Challenge from Recent Quiz
      </Typography>
      <List dense sx={{p:0}}>
        {results.slice(0, showAll ? results.length : MAX_INITIAL_DISPLAY).map((result) => (
          <HistoricalResultItem
            key={`recent-challengeable-${result.id}`}
            result={result}
            onResultClick={() => onInitiateChallenge(result)}
            showDeleteButton={false} // These are just for display to start a challenge
          />
        ))}
      </List>
      {results.length > MAX_INITIAL_DISPLAY && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button
            onClick={() => setShowAll(!showAll)}
            sx={{ color: effectiveAccentColor }}
            size="small"
          >
            {showAll ? 'Show Less' : `Show More (${results.length - MAX_INITIAL_DISPLAY} more)`}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default RecentAttemptsForChallenge;