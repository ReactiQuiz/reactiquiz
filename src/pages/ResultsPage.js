// src/pages/ResultsPage.js
import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useResults } from '../hooks/useResults';
import { useSubjectColors } from '../contexts/SubjectColorsContext';
import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoricalResultDetailView from '../components/results/HistoricalResultDetailView';
import PollIcon from '@mui/icons-material/Poll';

function ResultsPage() {
    const { resultId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { getColor } = useSubjectColors(); // Use the hook to get the color function
    
    // The useResults hook now handles all data fetching
    const { historicalList, detailData, isLoading, error } = useResults(resultId);

    // Determine the accent color. For detail view, use the specific result's subject. For list view, use a default.
    const accentColor = resultId && detailData?.result?.subject
        ? getColor(detailData.result.subject)
        : getColor('default'); // Fallback to a default color for the list view title

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, margin: 'auto' }}>
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
                {currentUser?.name || 'Your'} Quiz History
            </Typography>

            {resultId ? (
                <HistoricalResultDetailView detailData={detailData} navigate={navigate} />
            ) : (
                <HistoricalResultsList results={historicalList} />
            )}
        </Box>
    );
}

export default ResultsPage;