// src/components/results/HistoricalResultsList.js
import React from 'react';
import { Grid, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HistoricalResultItem from './HistoricalResultItem';
import SkeletonGrid from '../shared/SkeletonGrid';

function HistoricalResultsList({ results, isLoading, accentColor }) {
  const navigate = useNavigate();

  // 2. USE the new component for the loading state
  if (isLoading) {
    // Using custom height and count for this page
    return <SkeletonGrid count={4} height={180} />;
  }

  if (!results || results.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mt: 4, borderTop: `5px solid ${accentColor}` }}>
        <Typography variant="h6" gutterBottom>No Saved Results Found</Typography>
        <Typography sx={{ mb: 2 }}>You haven't completed any quizzes yet.</Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/subjects')}
          sx={{ backgroundColor: accentColor }}
        >
          Explore Quizzes
        </Button>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
      {results.map((result) => (
        <Grid item key={result.id} xs={12} sm={6} md={4} lg={3}>
          <HistoricalResultItem result={result} />
        </Grid>
      ))}
    </Grid>
  );
}

export default HistoricalResultsList;