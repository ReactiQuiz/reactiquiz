// src/components/results/HistoricalResultsList.js
import React from 'react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HistoricalResultItem from './HistoricalResultItem';
import ResultsFilters from './ResultsFilters';
import ClearAllIcon from '@mui/icons-material/ClearAll';

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
 <Paper sx={{ p: 2, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Sort By</InputLabel>
                        <Select value={sortOrder} label="Sort By" onChange={(e) => setSortOrder(e.target.value)}>
                            <MenuItem value="date_desc">Most Recent</MenuItem>
                            <MenuItem value="date_asc">Oldest First</MenuItem>
                            <MenuItem value="score_desc">Score (High-Low)</MenuItem>
                            <MenuItem value="score_asc">Score (Low-High)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Filter by Class</InputLabel>
                        <Select name="class" value={filters.class} label="Filter by Class" onChange={handleFilterChange}>
                            <MenuItem value="all"><em>All Classes</em></MenuItem>
                            {availableClasses.map(cls => <MenuItem key={cls} value={cls}>{cls}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Filter by Genre</InputLabel>
                        <Select name="genre" value={filters.genre} label="Filter by Genre" onChange={handleFilterChange}>
                            <MenuItem value="all"><em>All Genres</em></MenuItem>
                            {availableGenres.map(genre => <MenuItem key={genre} value={genre}>{genre}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ClearAllIcon />}
                        onClick={clearFilters}
                        disabled={!isFiltered}
                        sx={{ height: '56px' }} // Match height of TextFields
                    >
                        Clear Filters
                    </Button>
                </Grid>
            </Grid>
        </Paper>
        
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