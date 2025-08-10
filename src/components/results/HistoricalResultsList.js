// src/components/results/HistoricalResultsList.js
import React from 'react';
import { Box, Typography, Paper, Button, Divider, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import HistoricalResultItem from './HistoricalResultItem';
// --- START OF CHANGE: Import the EmptyState component ---
import EmptyState from '../shared/EmptyState';
import SearchOffIcon from '@mui/icons-material/SearchOff';
// --- END OF CHANGE ---

function HistoricalResultsList({
    results, filters, setFilters, sortOrder, setSortOrder, availableClasses, availableGenres, clearFilters
}) {
  const navigate = useNavigate();

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const isFiltered = filters.class !== 'all' || filters.genre !== 'all';
  
  // --- START OF THE DEFINITIVE FIX ---
  // The logic for what to display is now separate from the filter controls.
  const latestResult = sortOrder === 'date_desc' && !isFiltered && results.length > 0 ? results[0] : null;
  const otherResults = sortOrder === 'date_desc' && !isFiltered && results.length > 0 ? results.slice(1) : results;

  return (
    <Box>
        {/* Step 1: Always render the filter controls at the top. */}
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
                        sx={{ height: '56px' }}
                    >
                        Clear Filters
                    </Button>
                </Grid>
            </Grid>
        </Paper>

        {/* Step 2: Conditionally render either the results or the empty state message. */}
        {results.length > 0 ? (
            <>
                {latestResult && (
                    <Box mb={4}>
                        <Divider sx={{ my: 4 }}><Typography variant="overline">Most Recent</Typography></Divider>
                        <HistoricalResultItem result={latestResult} />
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
            </>
        ) : (
            // Use the professional EmptyState component for a better UI.
            <EmptyState
                IconComponent={SearchOffIcon}
                title="No Saved Results Found"
                message="No results match your current filters. Try clearing them to see all your history."
                actionText="Explore Quizzes"
                onActionClick={() => navigate('/subjects')}
            />
        )}
    </Box>
  );
  // --- END OF THE DEFINITIVE FIX ---
}

export default HistoricalResultsList;