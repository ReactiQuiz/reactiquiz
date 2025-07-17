// src/components/dashboard/OverallStatsCards.js
import { Paper, Typography } from '@mui/material';

function OverallStatsCards({ totalQuizzes, averageScore, accentColor, isFiltered }) {
  const effectiveAccentColor = accentColor || '#757575'; // fallback grey

  return (
    <>
        {/* Card 1: Total Quizzes Solved */}
        <Paper sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center', height: '100%', borderTop: `4px solid ${effectiveAccentColor}` }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                Total Quizzes Solved
            </Typography>
            <Typography variant="h3" sx={{ color: effectiveAccentColor, fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                {totalQuizzes}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {isFiltered ? '(in selected filter)' : '(in selected period)'}
            </Typography>
        </Paper>

        {/* Card 2: Overall Average Score */}
        <Paper sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center', height: '100%', borderTop: `4px solid ${effectiveAccentColor}` }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                Overall Average Score
            </Typography>
            <Typography variant="h3" sx={{ color: effectiveAccentColor, fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                {averageScore}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {isFiltered ? '(in selected filter)' : '(in selected period)'}
            </Typography>
        </Paper>
    </>
  );
}

export default OverallStatsCards;