// src/components/results/HistoricalResultsList.js
import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HistoricalResultItem from './HistoricalResultItem';

function HistoricalResultsList({ results }) {
  const navigate = useNavigate();

  if (!results) {
    return null;
  }
  
  if (results.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" gutterBottom>No Saved Results Found</Typography>
        <Typography sx={{ mb: 2 }}>You haven't completed any quizzes yet.</Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/subjects')}
        >
          Explore Quizzes
        </Button>
      </Paper>
    );
  }

  return (
    // --- START OF FIX: Replaced MUI Grid with a robust CSS Grid Box ---
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 2,
      }}
    >
      {results.map((result) => (
        <HistoricalResultItem key={result.id} result={result} />
      ))}
    </Box>
    // --- END OF FIX ---
  );
}

export default HistoricalResultsList;