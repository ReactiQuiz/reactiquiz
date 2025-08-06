// src/components/results/ResultsFilters.js
import React from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function ResultsFilters({
    filters,
    setFilters,
    sortOrder,
    setSortOrder,
    availableClasses,
    availableGenres
}) {
    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel id="sort-order-label">Sort By</InputLabel>
                    <Select
                        labelId="sort-order-label"
                        value={sortOrder}
                        label="Sort By"
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <MenuItem value="date_desc">Most Recent</MenuItem>
                        <MenuItem value="date_asc">Oldest First</MenuItem>
                        <MenuItem value="score_desc">Score (High to Low)</MenuItem>
                        <MenuItem value="score_asc">Score (Low to High)</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel id="class-filter-label">Filter by Class</InputLabel>
                    <Select
                        labelId="class-filter-label"
                        name="class"
                        value={filters.class}
                        label="Filter by Class"
                        onChange={handleFilterChange}
                    >
                        <MenuItem value="all"><em>All Classes</em></MenuItem>
                        {availableClasses.map(cls => <MenuItem key={cls} value={cls}>{cls}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel id="genre-filter-label">Filter by Genre</InputLabel>
                    <Select
                        labelId="genre-filter-label"
                        name="genre"
                        value={filters.genre}
                        label="Filter by Genre"
                        onChange={handleFilterChange}
                    >
                        <MenuItem value="all"><em>All Genres</em></MenuItem>
                        {availableGenres.map(genre => <MenuItem key={genre} value={genre}>{genre}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );
}

export default ResultsFilters;