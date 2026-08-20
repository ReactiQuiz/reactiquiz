// src/pages/ResultsPage.tsx
/**
 * Results Page
 * 
 * Displays historical quiz results with interactive filters, analytics summary header,
 * and detailed result view navigation.
 */
import React from 'react';
import { Box, Typography, CircularProgress, Alert, useTheme, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuizIcon from '@mui/icons-material/Quiz';
import { useResults } from '../hooks/useResults';
import HistoricalResultsList from '../components/results/HistoricalResultsList';
import HistoricalResultDetailView from '../components/results/HistoricalResultDetailView';

const ResultsPage: React.FC = () => {
  const { resultId } = useParams<{ resultId?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    historicalList, isLoading, error,
    filters, setFilters, sortOrder, setSortOrder, availableClasses, availableGenres, clearFilters
  } = useResults();

  const accentColor = theme.palette.primary.main;

  // Calculate quick summary metrics
  const totalQuizzes = historicalList.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(historicalList.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalQuizzes)
    : 0;
  const bestScore = totalQuizzes > 0
    ? Math.max(...historicalList.map(r => r.percentage || 0))
    : 0;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: accentColor }} />
        <Typography sx={{ ml: 2, fontWeight: 600 }}>Loading Results...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (resultId) {
    return (
      <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
        <HistoricalResultDetailView
          resultId={resultId}
          onBack={() => navigate('/results')}
          accentColor={accentColor}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: 'auto', width: '100%' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, fontWeight: 800, mb: 1 }}>
          My Quiz Results
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', maxWidth: '60ch' }}>
          Review your past test performances, track accuracy trends, and analyze step-by-step question breakdowns.
        </Typography>
      </Box>

      {/* Overview Stat Cards */}
      {totalQuizzes > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5, mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: theme => alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'primary.main', color: '#fff', display: 'grid', placeItems: 'center' }}>
              <QuizIcon />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{totalQuizzes}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Quizzes Solved</Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: theme => alpha(theme.palette.secondary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'secondary.main', color: '#fff', display: 'grid', placeItems: 'center' }}>
              <AssessmentIcon />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{avgScore}%</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Average Accuracy</Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: theme => alpha(theme.palette.success.main, 0.08),
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'success.main', color: '#fff', display: 'grid', placeItems: 'center' }}>
              <EmojiEventsIcon />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{bestScore}%</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>High Score</Typography>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Main Results List */}
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
