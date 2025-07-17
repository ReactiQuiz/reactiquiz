// src/components/results/HistoricalResultsList.js
import React from 'react';
import { Box, Typography, Paper, Button, Alert, Grid } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import HistoricalResultItem from './HistoricalResultItem';

function HistoricalResultsList({
  results,
  isLoading,
  error,
  deleteError,
  onDeleteClick,
  currentUser,
  accentColor
}) {
  const navigate = useNavigate();

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  if (deleteError) {
    return <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>;
  }

  if (!results || results.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mt: 4, borderTop: `5px solid ${accentColor}` }}>
        <Typography variant="h6" gutterBottom>No Saved Results Found</Typography>
        <Typography sx={{ mb: 2 }}>You haven't completed any quizzes yet under this account.</Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/subjects')}
          sx={{ backgroundColor: accentColor, '&:hover': { backgroundColor: theme => theme.palette.augmentColor({ color: { main: accentColor } }).dark } }}
        >
          Explore Quizzes
        </Button>
      </Paper>
    );
  }

  return (
    <Grid container width="100%" spacing={{
      xs: '0%',
      sm: '2%',
      md: '1%',
      lg: '1%',
      xl: '2%'
    }}>
      {results.map((result) => (
        // Grid item sizing for 1, 2, 4, and 6 columns
        <Grid item key={result.id} width={{
          xs: '100%',
          sm: '49%',
          md: '24.25%',
          lg: '15.75%',
          xl: '15%'
        }} sx={{ mt: 2 }}>
          <HistoricalResultItem
            result={result}
            onDeleteClick={onDeleteClick}
            showDeleteButton={currentUser && currentUser.id === result.userId}
            isChallengeResult={!!result.challenge_id}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default HistoricalResultsList;