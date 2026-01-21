// src/pages/ResultsPage.tsx
/**
 * Results Page
 * 
 * This page displays quiz results for the authenticated user. It shows
 * either a list of historical results or a detailed view of a specific
 * result based on the URL parameter.
 */
import React from 'react';
import { Box, Typography, CircularProgress, Alert, useTheme } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useResults } from '../hooks/useResults';
import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoricalResultDetailView from '../components/results/HistoricalResultDetailView';

/**
 * Results Page Component
 * 
 * Displays quiz results with:
 * - Historical results list (when no resultId in URL)
 * - Result detail view (when resultId in URL)
 * - Filtering and sorting capabilities
 * - Loading states during data fetch
 * - Error message display
 * - Navigation between list and detail views
 * - Back navigation from detail to list
 * 
 * This page is only accessible to authenticated users. It shows
 * only the current user's quiz results.
 * 
 * @returns {JSX.Element} Results page with list or detail view
 */
const ResultsPage: React.FC = () => {
  const { resultId } = useParams<{ resultId?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    historicalList, isLoading, error,
    filters, setFilters, sortOrder, setSortOrder, availableClasses, availableGenres, clearFilters
  } = useResults();

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
        My Quiz Results
      </Typography>

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
  );
};

export default ResultsPage;
