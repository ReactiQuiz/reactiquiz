// src/pages/ResultsPage.js
import { Box, Typography, useTheme, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useResults } from '../hooks/useResults';
import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoricalResultDetailView from '../components/results/HistoricalResultDetailView';
import HistoryIcon from '@mui/icons-material/History';

function ResultsPage() {
  const theme = useTheme();
  const { resultId } = useParams();
  const { currentUser } = useAuth();
  const { historicalList, detailData, isLoading, error } = useResults(resultId);
  const RESULTS_PAGE_ACCENT_COLOR = theme.palette.resultsAccent?.main || theme.palette.info.main;

  const renderContent = () => {
    if (isLoading && resultId) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress sx={{ color: RESULTS_PAGE_ACCENT_COLOR }} />
        </Box>
      );
    }
    if (error) {
      return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }
    if (resultId && detailData) {
      return <HistoricalResultDetailView detailData={detailData} />;
    } else {
      return <HistoricalResultsList results={historicalList} isLoading={isLoading} accentColor={RESULTS_PAGE_ACCENT_COLOR} />;
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: "100%", margin: 'auto', mt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center', color: RESULTS_PAGE_ACCENT_COLOR, fontWeight: 'bold' }}>
        <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.3em' }} />
        {currentUser?.name || 'My'} Quiz History
      </Typography>
      {renderContent()}
    </Box>
  );
}

export default ResultsPage;