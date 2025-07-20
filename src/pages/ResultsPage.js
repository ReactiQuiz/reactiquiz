// src/pages/ResultsPage.js
import { Box, Typography, useTheme, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useResults } from '../hooks/useResults'; // We'll create this hook next
import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoryIcon from '@mui/icons-material/History';

function ResultsPage() {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const { historicalList, isLoading, error } = useResults(); // Using a simple hook

  const RESULTS_PAGE_ACCENT_COLOR = theme.palette.resultsAccent?.main || theme.palette.info.main;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '1200px', margin: 'auto', mt: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center', color: RESULTS_PAGE_ACCENT_COLOR, fontWeight: 'bold' }}>
        <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.3em' }} />
        {currentUser?.name || 'My'} Quiz History
      </Typography>

      {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
              <CircularProgress sx={{ color: RESULTS_PAGE_ACCENT_COLOR }} />
          </Box>
      )}

      {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
      
      {!isLoading && !error && (
          <HistoricalResultsList
              results={historicalList}
              accentColor={RESULTS_PAGE_ACCENT_COLOR}
          />
      )}
    </Box>
  );
}

export default ResultsPage;