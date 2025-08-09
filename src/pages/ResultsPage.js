// src/pages/ResultsPage.js
import React from 'react';
import { Box, Typography, CircularProgress, Alert, useTheme } from '@mui/material';
// --- START OF FIX: Remove useLocation ---
import { useParams, useNavigate } from 'react-router-dom';
// --- END OF FIX ---
import { useAuth } from '../contexts/AuthContext';
import { useResults } from '../hooks/useResults';
import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoricalResultDetailView from '../components/results/HistoricalResultDetailView';
// --- START OF FIX: Remove CurrentResultView import as it's no longer used in this flow ---
// import CurrentResultView from '../components/results/CurrentResultView'; 
// --- END OF FIX ---


function ResultsPage() {
    const { resultId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    // --- START OF FIX: Remove location state logic ---
    // const location = useLocation();
    // const isNewResult = location.state?.justFinished;
    // const newResultData = location.state?.resultData;
    // --- END OF FIX ---

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
            {/* --- START OF FIX: Simplified conditional rendering --- */}
            {resultId ? (
                // If a resultId is in the URL, show the detail view for that historical result.
                <HistoricalResultDetailView detailData={detailData} navigate={navigate} />
            ) : (
                // Otherwise, show the main list of all historical results.
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
            {/* --- END OF FIX --- */}
        </Box>
    );
}

export default ResultsPage;