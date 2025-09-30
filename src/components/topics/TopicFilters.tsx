// src/components/topics/TopicFilters.tsx
import React from 'react';
import { Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { TopicFiltersProps } from '../../types';

const TopicFilters: React.FC<TopicFiltersProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedClass, 
  setSelectedClass, 
  selectedGenre, 
  setSelectedGenre, 
  availableClasses, 
  availableGenres 
}) => {
  return (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            label="Search Topics"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
            }}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Class</InputLabel>
            <Select value={selectedClass} label="Filter by Class" onChange={(e) => setSelectedClass(e.target.value)}>
              <MenuItem value=""><em>All Classes</em></MenuItem>
              {availableClasses.map(cls => <MenuItem key={cls} value={cls}>{cls}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Genre</InputLabel>
            <Select value={selectedGenre} label="Filter by Genre" onChange={(e) => setSelectedGenre(e.target.value)}>
              <MenuItem value=""><em>All Genres</em></MenuItem>
              {availableGenres.map(genre => <MenuItem key={genre} value={genre}>{genre}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TopicFilters;
