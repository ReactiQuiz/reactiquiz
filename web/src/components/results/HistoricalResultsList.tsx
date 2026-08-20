// src/components/results/HistoricalResultsList.tsx
/**
 * Historical Results List Component
 * 
 * Renders filter controls and responsive grid of historical quiz result items.
 */
import React from 'react';
import { Box, Typography, Paper, Button, Divider, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import HistoricalResultItem from './HistoricalResultItem';
import EmptyState from '../shared/EmptyState';

function HistoricalResultsList({
  results,
  filters,
  setFilters,
  sortOrder,
  setSortOrder,
  availableClasses,
  availableGenres,
  clearFilters
}: any) {
  const navigate = useNavigate();

  const handleFilterChange = (event: any) => {
    const { name, value } = event.target;
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const isFiltered = filters.class !== 'all' || filters.genre !== 'all' || filters.subject !== 'all';
  
  const latestResult = sortOrder === 'date_desc' && !isFiltered && results.length > 0 ? results[0] : null;
  const otherResults = sortOrder === 'date_desc' && !isFiltered && results.length > 0 ? results.slice(1) : results;

  return (
    <Box>
      {/* Filter Controls Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 3,
          border: theme => `1px solid ${theme.palette.divider}`,
          bgcolor: theme => alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'blur(8px)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-order-select-label">Sort By</InputLabel>
              <Select
                labelId="sort-order-select-label"
                value={sortOrder}
                label="Sort By"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="date_desc">Most Recent</MenuItem>
                <MenuItem value="date_asc">Oldest First</MenuItem>
                <MenuItem value="score_desc">Highest Score</MenuItem>
                <MenuItem value="score_asc">Lowest Score</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="class-filter-select-label">Filter by Class</InputLabel>
              <Select
                labelId="class-filter-select-label"
                name="class"
                value={filters.class}
                label="Filter by Class"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Classes</MenuItem>
                {availableClasses.map((cls: string) => (
                  <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="genre-filter-select-label">Filter by Genre</InputLabel>
              <Select
                labelId="genre-filter-select-label"
                name="genre"
                value={filters.genre}
                label="Filter by Genre"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Genres</MenuItem>
                {availableGenres.map((genre: string) => (
                  <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="medium"
              startIcon={<ClearAllIcon />}
              onClick={clearFilters}
              disabled={!isFiltered}
              sx={{ height: 40, borderRadius: 2 }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Display */}
      {results.length > 0 ? (
        <>
          {latestResult && (
            <Box mb={4}>
              <Divider sx={{ mb: 3 }}>
                <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.06em', color: 'primary.main' }}>
                  Most Recent Attempt
                </Typography>
              </Divider>
              <Box sx={{ maxWidth: 650, mx: 'auto' }}>
                <HistoricalResultItem result={latestResult} />
              </Box>
            </Box>
          )}
          
          {otherResults.length > 0 && latestResult && (
            <Divider sx={{ my: 4 }}>
              <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.06em', color: 'text.secondary' }}>
                Past Quiz Attempts ({otherResults.length})
              </Typography>
            </Divider>
          )}

          <Grid container spacing={3}>
            {otherResults.map((result: any) => (
              <Grid item xs={12} sm={6} md={4} key={result.id}>
                <HistoricalResultItem result={result} />
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <EmptyState
          IconComponent={SearchOffIcon}
          title="No Saved Results Found"
          message="No quiz attempts match your selected criteria. Try adjusting or clearing your filters."
          actionText="Explore Practice Topics"
          onActionClick={() => navigate('/subjects')}
        />
      )}
    </Box>
  );
}

export default HistoricalResultsList;