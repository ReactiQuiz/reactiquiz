// src/pages/DashboardPage.tsx
/**
 * Dashboard Page
 * 
 * Displays comprehensive quiz analytics and statistics for the authenticated user.
 * Includes overall performance metrics, subject-wise breakdowns, and rolling performance trends.
 */
import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { useDashboard, TimeFilter } from '../hooks/useDashboard';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Chart as ChartJS, PointElement, LineElement, Filler, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, Title } from 'chart.js';
import { Line } from 'react-chartjs-2';
import ExpandedCardPortal from '../components/dashboard/ExpandedCardPortal';
import ScoreRing from '../components/shared/ScoreRing';
import QuizIcon from '@mui/icons-material/Quiz';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useSubjectColors } from '../contexts/SubjectColorsContext';

const SUBJECT_TILE_COLORS = ['#3B82F6', '#10B981', '#6366F1', '#06B6D4', '#8B5CF6', '#F59E0B'];

const Glass = styled(Paper)(({ theme }) => ({
  backdropFilter: 'blur(8px)',
  background: alpha(theme.palette.background.paper, 0.7),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
}));

const Card = styled(Paper)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(2.5),
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
  '&:hover': {
    borderColor: theme.palette.mode === 'light' ? '#CBD5E1' : '#475569',
    boxShadow: theme.palette.mode === 'light' ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  }
}));

const CountUpNumber: React.FC<{ end: number; duration?: number; sx?: any; variant?: any }> = ({ end, duration = 1200, sx, variant = 'h2' }) => {
  const [val, setVal] = useState(0);
  React.useEffect(() => {
    let raf: number | null = null;
    let start: number | null = null;
    const step = (t: number) => {
      if (start == null) start = t;
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.round(p * end));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [end, duration]);
  return <Typography variant={variant} sx={sx}>{val}</Typography>;
};

ChartJS.register(PointElement, LineElement, Filler, ChartTooltip, Legend, CategoryScale, LinearScale, Title);

export default function DashboardPage() {
  const theme = useTheme();
  const { getColor } = useSubjectColors();
  const { data, isLoading, timeFilter, setTimeFilter, subjectFilter, setSubjectFilter } = useDashboard();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const availableSubjects = data?.availableSubjects || ['all'];

  const lineData = data ? {
    labels: data.rollingAverageData.map(d => d.date.slice(5)),
    datasets: [{
      label: 'Avg %',
      data: data.rollingAverageData.map(d => d.averageScore),
      fill: true,
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 6,
    }]
  } : { labels: [], datasets: [] };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { min: 0, max: 100, ticks: { stepSize: 20 } }
    }
  };

  const getTrendTitle = (filter: TimeFilter): string => {
    switch (filter) {
      case 'week': return '7-Day Performance Trend';
      case 'quarter': return '90-Day Performance Trend';
      case 'year': return '1-Year Performance Trend';
      case 'all': return 'All-Time Performance Trend';
      case 'month':
      default: return '30-Day Performance Trend';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header controls */}
      <Glass
        elevation={0}
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, flexShrink: 0, fontSize: '1.25rem' }}>Dashboard Summary</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <FormControl size="small" fullWidth sx={{ minWidth: { xs: '100%', sm: 180 }, flex: { xs: '1 1 auto', sm: '0 0 180px' } }}>
            <InputLabel sx={{ fontSize: '0.95rem' }}>Time Period</InputLabel>
            <Select label="Time Period" value={timeFilter} onChange={e => setTimeFilter(e.target.value as any)} sx={{ fontSize: '0.95rem' }}>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last 90 Days</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth sx={{ minWidth: { xs: '100%', sm: 180 }, flex: { xs: '1 1 auto', sm: '0 0 180px' } }}>
            <InputLabel sx={{ fontSize: '0.95rem' }}>Subject</InputLabel>
            <Select label="Subject" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} sx={{ fontSize: '0.95rem', textTransform: 'capitalize' }}>
              {availableSubjects.map(s => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Glass>

      {/* Top Row - Overview */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem', color: 'text.secondary' }}>Total Quizzes Solved</Typography>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: theme => alpha(theme.palette.primary.main, 0.1), display: 'grid', placeItems: 'center' }}>
                  <QuizIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
                <CountUpNumber end={data?.totalQuizzes ?? 0} variant="h3" sx={{ fontWeight: 800, fontSize: '2.4rem' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>completed</Typography>
              </Box>
            </Card>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem', color: 'text.secondary' }}>Overall Average Score</Typography>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: theme => alpha(theme.palette.secondary.main, 0.1), display: 'grid', placeItems: 'center' }}>
                  <AnalyticsIcon sx={{ color: 'secondary.main', fontSize: 22 }} />
                </Box>
              </Box>
              <Box sx={{ mt: 1 }}>
                <ScoreRing
                  percent={data?.overallAverageScore || 0}
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem', color: 'text.secondary' }}>
                      Questions: {data ? `${data.overallQuestionStats.correct}/${data.overallQuestionStats.total}` : '0/0'}
                    </Typography>
                  }
                />
              </Box>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Subject tiles carousel */}
      {data && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700, fontSize: '1.35rem' }}>Subject-Wise Performance</Typography>
          <Box sx={{ display: 'flex', gap: 2.5, overflowX: 'auto', pb: 1.5, pr: 1 }}>
            {Object.keys(data.subjectBreakdowns).map((key, idx) => {
              const sb = data.subjectBreakdowns[key];
              const c = getColor(key) || SUBJECT_TILE_COLORS[idx % SUBJECT_TILE_COLORS.length];
              return (
                <Box
                  key={key}
                  sx={{ minWidth: { xs: 220, sm: 280 }, cursor: 'pointer' }}
                  onClick={() => setExpandedSubject(sb.name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') setExpandedSubject(sb.name); }}
                >
                  <Card sx={{ borderTop: `4px solid ${c}`, p: 2.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: c, mb: 0.5, fontSize: '1.2rem', textTransform: 'capitalize' }}>{sb.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontSize: '0.9rem' }}>{sb.average}% avg • {sb.count} quiz(zes)</Typography>
                    <Box sx={{ height: 8, borderRadius: 999, background: theme => alpha(theme.palette.text.disabled, 0.15), overflow: 'hidden', mb: 1 }}>
                      <Box sx={{ height: '100%', width: `${sb.average}%`, background: c }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">Total Attempted: {sb.totalCorrect}/{sb.totalQuestions} correct</Typography>
                  </Card>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Performance trend chart */}
      <Card sx={{ p: { xs: 2, sm: 3 }, mt: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, fontSize: '1.15rem' }}>
          {getTrendTitle(timeFilter)}
        </Typography>
        <Box sx={{ height: 260 }}>
          <Line data={lineData} options={lineOptions} />
        </Box>
      </Card>

      {/* Portal modal for detailed subject breakdown */}
      {expandedSubject && (
        <ExpandedCardPortal
          open={!!expandedSubject}
          onClose={() => setExpandedSubject(null)}
          subjectName={expandedSubject}
        />
      )}
    </Box>
  );
}