// src/components/results/HistoricalResultsList.js
import React from 'react';
import { Grid, Typography, Paper, Button, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HistoricalResultItem from './HistoricalResultItem';

function HistoricalResultsList({ results }) {
  const navigate = useNavigate();

  // isLoading state is now handled by the parent ResultsPage
  if (!results) {
    return null; // Should be handled by parent's isLoading check
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
   <Grid container width="100%" spacing={{ xs:"0%", sm:"1%", md:"1%", lg:"1%", xl:"1%" }}>
      {results.map((result) => (
        <Grid item key={result.id} mb="1%" width={{ xs: "100%", sm: "50%", md: "33.333333%", lg: "25%", xl: "20%" }}>
          <HistoricalResultItem result={result} />
        </Grid>
      ))}
    </Grid>
  );
}

export default HistoricalResultsList;