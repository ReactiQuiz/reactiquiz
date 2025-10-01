// src/pages/ResultsPage.tsx
import React, { useState, SyntheticEvent } from 'react';
import { Box, Typography, CircularProgress, Alert, useTheme, Tabs, Tab } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useResults } from '../hooks/useResults';
import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoricalResultDetailView from '../components/results/HistoricalResultDetailView';
import SubjectiveResultsList from '../components/results/SubjectiveResultsList';

const ResultsPage: React.FC = () => {
  const { resultId } = useParams<{ resultId?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState<number>(0);

  const {
    historicalList, isLoading, error,
    filters, setFilters, sortOrder, setSortOrder, availableClasses, availableGenres, clearFilters
  } = useResults();
  
  const handleTabChange = (event: SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
  };

  const accentColor = theme.palette.info.main;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: accentColor }} />
        <Typography sx={{ ml: 2 }}>Loading Results...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (resultId) {
    return (
      <Box sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 }, width: '100%' }}>
        <HistoricalResultDetailView
          resultId={resultId}
          onBack={() => navigate('/results')}
          accentColor={accentColor}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 }, width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
        My Results
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Objective Quizzes" />
          <Tab label="Subjective Papers" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
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

      {tabValue === 1 && (
        <SubjectiveResultsList />
      )}
    </Box>
  );
};

export default ResultsPage;
