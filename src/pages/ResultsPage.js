// src/pages/ResultsPage.js
import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, useTheme, Tabs, Tab } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useResults } from '../hooks/useResults';
import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoricalResultDetailView from '../components/results/HistoricalResultDetailView';
import CurrentResultView from '../components/results/CurrentResultView';
import SubjectiveResultsList from '../components/results/SubjectiveResultsList';


function ResultsPage() {
    const { resultId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);

    const {
        historicalList, detailData, isLoading, error,
        filters, setFilters, sortOrder, setSortOrder, availableClasses, availableGenres, clearFilters
    } = useResults();
    
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

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
            {resultId ? (
                // If a resultId is in the URL, show the detail view for that historical result.
                <HistoricalResultDetailView detailData={detailData} navigate={navigate} />
            ) : (
                // Otherwise, show the tabbed interface for different quiz types
                <Box>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="quiz results tabs">
                            <Tab label="Objective Quiz" id="tab-0" aria-controls="tabpanel-0" />
                            <Tab label="Subjective Quiz" id="tab-1" aria-controls="tabpanel-1" />
                            <Tab label="Exams" id="tab-2" aria-controls="tabpanel-2" disabled />
                        </Tabs>
                    </Box>
                    
                    {tabValue === 0 && (
                        <Box id="tabpanel-0" role="tabpanel" aria-labelledby="tab-0">
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
                        </Box>
                    )}
                    
                    {tabValue === 1 && (
                        <Box id="tabpanel-1" role="tabpanel" aria-labelledby="tab-1">
                            <SubjectiveResultsList />
                        </Box>
                    )}
                    
                    {tabValue === 2 && (
                        <Box id="tabpanel-2" role="tabpanel" aria-labelledby="tab-2">
                            <Typography variant="body1">Exam results will be available soon.</Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}

export default ResultsPage;