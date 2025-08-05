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
    const { getColor } = useSubjectColors();
    const theme = useTheme();
    
    const { historicalList, detailData, isLoading, error } = useResults(resultId);

    const accentColor = theme.palette.info.main;

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
                {/* --- START OF FIX: Use currentUser.name for the title --- */}
                {currentUser?.name}'s Quiz History
                {/* --- END OF FIX --- */}
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