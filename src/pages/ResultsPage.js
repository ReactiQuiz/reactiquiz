// src/pages/ResultsPage.js
import React from 'react';
import { Box, Typography, CircularProgress, Alert, useTheme } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useResults } from '../hooks/useResults';
import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoricalResultDetailView from '../components/results/HistoricalResultDetailView';
import CurrentResultView from '../components/results/CurrentResultView';

function ResultsPage() {
    const { resultId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const location = useLocation();
    const isNewResult = location.state?.justFinished;
    const newResultData = location.state?.resultData;

    const {
        historicalList, detailData, isLoading, error,
        filters, setFilters, sortOrder, setSortOrder, availableClasses, availableGenres, clearFilters
    } = useResults();

    const accentColor = theme.palette.info.main;

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress sx={{ color: accentColor }} />
            </Box>
        );
    }

    if (error) {
        return (<Box sx={{ p: 3, textAlign: 'center' }}><Alert severity="error">{error}</Alert></Box>);
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', margin: 'auto' }}>
            {isNewResult ? (
                // If we just finished a quiz, show the special "CurrentResultView"
                <CurrentResultView 
                    currentQuizDataFromState={newResultData} 
                    onViewHistory={() => navigate('/results', { replace: true })}
                    onNavigateHome={() => navigate('/')}
                />
            ) : resultId ? (
                // If viewing a specific old result, show the detail view
                <HistoricalResultDetailView detailData={detailData} navigate={navigate} />
            ) : (
                // Otherwise, show the list of all historical results
                <HistoricalResultsList
                    results={historicalList}
                    filters={filters}
                    setFilters={setFilters}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    availableClasses={availableClasses}
                    availableGenres={availableGenres}
                    clearFilters={clearFilters}
                />
            )}
        </Box>
    );
}

export default ResultsPage;