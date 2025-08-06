// src/components/results/HistoricalResultsList.js
import React from 'react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HistoricalResultItem from './HistoricalResultItem';
import ResultsFilters from './ResultsFilters';

function HistoricalResultsList({
    results, filters, setFilters, sortOrder, setSortOrder, availableClasses, availableGenres
}) {
  const navigate = useNavigate();

  if (!results) return null;
  
  if (results.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" gutterBottom>No Saved Results Found</Typography>
        <Typography sx={{ mb: 2 }}>No results match your current filters. Try clearing them to see all your history.</Typography>
        <Button variant="contained" onClick={() => navigate('/subjects')}>Explore Quizzes</Button>
      </Paper>
    );
  }

  // Separate the latest result if we are sorting by date
  const latestResult = sortOrder === 'date_desc' ? results[0] : null;
  const otherResults = sortOrder === 'date_desc' ? results.slice(1) : results;

  return (
    <Box>
        <ResultsFilters
            filters={filters}
            setFilters={setFilters}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            availableClasses={availableClasses}
            availableGenres={availableGenres}
        />

        {latestResult && (
            <Box mb={4}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Most Recent</Typography>
                <HistoricalResultItem result={latestResult} isFeatured={true} />
            </Box>
        )}
        
        {otherResults.length > 0 && latestResult && (
             <Divider sx={{ my: 4 }}><Typography variant="overline">Older Results</Typography></Divider>
        )}

        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 2,
            }}
        >
            {otherResults.map((result) => (
                <HistoricalResultItem key={result.id} result={result} />
            ))}
        </Box>
    </Box>
  );
}

export default HistoricalResultsList;