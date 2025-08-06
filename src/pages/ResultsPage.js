// src/pages/ResultsPage.js
import React from 'react';
import { Box, Typography, CircularProgress, Alert, useTheme } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useResults } from '../hooks/useResults';
import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoricalResultDetailView from '../components/results/HistoricalResultDetailView';
import PollIcon from '@mui/icons-material/Poll';

function ResultsPage() {
    const { resultId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    
    // Call the powerful hook to get all state and logic
    const { 
        historicalList, detailData, isLoading, error,
        filters, setFilters, sortOrder, setSortOrder, availableClasses, availableGenres 
    } = useResults();

    const accentColor = theme.palette.info.main;

    // Render loading state
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress sx={{ color: accentColor }} />
            </Box>
        );
    }

    // Render error state
    if (error) {
        return ( <Box sx={{ p: 3, textAlign: 'center' }}><Alert severity="error">{error}</Alert></Box> );
    }

    // Render main content
    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '1200px', margin: 'auto' }}>
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    color: accentColor,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <PollIcon sx={{ fontSize: '1.2em', mr: 1 }} />
                {currentUser?.name}'s Quiz History
            </Typography>

            {/* Conditionally render either the detail view or the list view */}
            {resultId ? (
                <HistoricalResultDetailView detailData={detailData} navigate={navigate} />
            ) : (
                <HistoricalResultsList 
                    results={historicalList} 
                    filters={filters}
                    setFilters={setFilters}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    availableClasses={availableClasses}
                    availableGenres={availableGenres}
                />
            )}
        </Box>
    );
}

export default ResultsPage;