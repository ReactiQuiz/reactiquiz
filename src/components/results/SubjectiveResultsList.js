// src/components/results/SubjectiveResultsList.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Divider, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import EmptyState from '../shared/EmptyState';
import apiClient from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import SubjectiveResultItem from './SubjectiveResultItem';

function SubjectiveResultsList() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ class: 'all', genre: 'all' });
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);

  useEffect(() => {
    const fetchSubjectiveResults = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data } = await apiClient.get('/api/subjective/results');
        setResults(data || []);
        
        // Extract available classes and genres for filters
        const classes = [...new Set(data.map(res => res.class).filter(Boolean))];
        const genres = [...new Set(data.map(res => res.genre).filter(Boolean))];
        
        setAvailableClasses(classes.sort());
        setAvailableGenres(genres.sort());
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load subjective results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectiveResults();
  }, [currentUser]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ class: 'all', genre: 'all' });
    setSortOrder('date_desc');
  };

  const isFiltered = filters.class !== 'all' || filters.genre !== 'all';

  // Apply filters and sorting
  const filteredResults = results.filter(result => {
    if (filters.class !== 'all' && result.class !== filters.class) return false;
    if (filters.genre !== 'all' && result.genre !== filters.genre) return false;
    return true;
  }).sort((a, b) => {
    switch (sortOrder) {
      case 'date_asc':
        return new Date(a.timestamp) - new Date(b.timestamp);
      case 'score_desc':
        return b.total_marks_awarded - a.total_marks_awarded;
      case 'score_asc':
        return a.total_marks_awarded - b.total_marks_awarded;
      case 'date_desc':
      default:
        return new Date(b.timestamp) - new Date(a.timestamp);
    }
  });

  const latestResult = sortOrder === 'date_desc' && !isFiltered && filteredResults.length > 0 ? filteredResults[0] : null;
  const otherResults = sortOrder === 'date_desc' && !isFiltered && filteredResults.length > 0 ? filteredResults.slice(1) : filteredResults;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!currentUser) {
    return (
      <EmptyState
        IconComponent={SearchOffIcon}
        title="Login Required"
        message="Please login to view your subjective quiz results."
        actionText="Login"
        onActionClick={() => navigate('/login')}
      />
    );
  }

  return (
    <Box>
      {/* Filter controls */}
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

      {/* Results display */}
      {filteredResults.length > 0 ? (
        <>
          {latestResult && (
            <Box mb={4}>
              <Divider sx={{ my: 4 }}><Typography variant="overline">Most Recent</Typography></Divider>
              <SubjectiveResultItem result={latestResult} />
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
              <SubjectiveResultItem key={result.id} result={result} />
            ))}
          </Box>
        </>
      ) : (
        <EmptyState
          IconComponent={SearchOffIcon}
          title="No Subjective Quiz Results Found"
          message="No results match your current filters. Try clearing them to see all your history."
          actionText="Explore Quizzes"
          onActionClick={() => navigate('/subjects')}
        />
      )}
    </Box>
  );
}

export default SubjectiveResultsList;