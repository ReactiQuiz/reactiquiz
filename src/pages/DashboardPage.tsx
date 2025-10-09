// src/pages/DashboardPage.tsx
import React from 'react';
import { Box, Grid, Paper, Typography, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import { motion } from 'framer-motion';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, Title } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../hooks/useDashboard';

const Glass = styled(Paper)(({ theme }) => ({
  backdropFilter: 'blur(8px)',
  background: alpha(theme.palette.background.paper, 0.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  borderRadius: 16,
}));

const Card = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
}));

const Gauge = ({ value, label }: { value: number; label: string }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{Math.round(value)}%</Typography>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
  </Box>
);

export default function DashboardPage() {
  const { data, isLoading, timeFilter, setTimeFilter, subjectFilter, setSubjectFilter, availableSubjects } = useDashboard();

  ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, ChartTooltip, Legend, CategoryScale, LinearScale, Title);

  const subjectKeys = data ? Object.keys(data.subjectBreakdowns) : [];

  const lineData = data ? {
    labels: data.rollingAverageData.map(d => d.date.slice(5)),
    datasets: [{
      label: 'Avg %',
      data: data.rollingAverageData.map(d => d.averageScore),
      fill: true,
      borderColor: '#7aa2f7',
      backgroundColor: '#7aa2f722',
      tension: 0.35,
    }]
  } : { labels: [], datasets: [] };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, width: '100%' }}>
      {/* Filters Bar */}
      <Glass elevation={0} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>📊 Dashboard Summary</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Time Period</InputLabel>
            <Select label="Time Period" value={timeFilter} onChange={e => setTimeFilter(e.target.value as any)}>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last 90 Days</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Subject</InputLabel>
            <Select label="Subject" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
              {availableSubjects.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Glass>

      {/* Top Row - Overview */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total Quizzes Solved</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{data?.totalQuizzes ?? 0}</Typography>
            </Box>
            </Card>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Overall Average Score</Typography>
            <Gauge value={data?.overallAverageScore ?? 0} label={data ? `${data.overallQuestionStats.correct} correct of ${data.overallQuestionStats.total}` : ''} />
            </Card>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Correct Answers by Difficulty</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 52px', rowGap: 1, alignItems: 'center' }}>
              {(['easy','medium','hard'] as const).map(k => (
                <React.Fragment key={k}>
                  <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{k}</Typography>
                  <Box sx={{ height: 8, borderRadius: 999, background: theme => alpha(theme.palette.primary.main, 0.15), overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${data ? data.overallDifficultyPerformance[k].percentage : 0}%`, background: t => t.palette.primary.main }} />
                  </Box>
                  <Typography variant="caption">{data ? data.overallDifficultyPerformance[k].percentage : 0}%</Typography>
                </React.Fragment>
              ))}
            </Box>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Subject tiles carousel */}
      {data && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>🧠 Subject-Wise Performance</Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, pr: 1 }}>
            {Object.keys(data.subjectBreakdowns).map((key, idx) => {
              const sb = data.subjectBreakdowns[key];
              const perf = data.subjectDifficultyPerformance[key];
              const colors = ['#7dcfff', '#bb9af7', '#a6e3a1', '#f7768e', '#e0af68', '#7aa2f7'];
              const c = colors[idx % colors.length];
              return (
                <Box component={motion.div}
                  key={key}
                  whileHover={{ scale: 1.03, boxShadow: `0 0 16px ${c}55` }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  sx={{ minWidth: 240 }}
                >
                  <Card sx={{ borderTop: `3px solid ${c}` }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: c, mb: 1 }}>{sb.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>{sb.average}% avg • {sb.count} quiz(zes)</Typography>
                  {(['easy','medium','hard'] as const).map((k, i) => (
                    <Box key={k} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{k}</Typography>
                        <Typography variant="caption">{perf?.[k].percentage || 0}%</Typography>
                      </Box>
                      <Box sx={{ height: 8, borderRadius: 999, background: theme => alpha(theme.palette.text.disabled, 0.15), overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${perf?.[k].percentage || 0}%`, background: c }} />
                      </Box>
                    </Box>
                  ))}
                  </Card>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Bottom charts */}
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={7}>
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>⚡ Difficulty Analysis</Typography>
              {data && subjectKeys.length > 0 ? (
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px', rowGap: 1.2, alignItems: 'center' }}>
                    {/* Header Row */}
                    <Box />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ width: 12, height: 6, background: '#22c55e', borderRadius: 999 }} />
                      <Typography variant="caption" color="text.secondary">Easy</Typography>
                      <Box sx={{ width: 12, height: 6, background: '#f59e0b', borderRadius: 999, ml: 1 }} />
                      <Typography variant="caption" color="text.secondary">Medium</Typography>
                      <Box sx={{ width: 12, height: 6, background: '#ef4444', borderRadius: 999, ml: 1 }} />
                      <Typography variant="caption" color="text.secondary">Hard</Typography>
                    </Box>
                    <Box />
                    {data.chartDifficultyBySubject.map((row) => (
                      <React.Fragment key={row.subject}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.subject}</Typography>
                        <Box sx={{ height: 12, borderRadius: 999, display: 'flex', overflow: 'hidden', background: theme => alpha(theme.palette.text.disabled, 0.15) }}>
                          <Box title={`Easy ${row.easyPercent}%`} sx={{ width: `${row.easyPercent}%`, background: '#22c55e' }} />
                          <Box title={`Med ${row.mediumPercent}%`} sx={{ width: `${row.mediumPercent}%`, background: '#f59e0b' }} />
                          <Box title={`Hard ${row.hardPercent}%`} sx={{ width: `${row.hardPercent}%`, background: '#ef4444' }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">Total: {row.total} • Avg: {row.avg}%</Typography>
                      </React.Fragment>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">No data</Typography>
              )}
            </Card>
          </Box>
        </Grid>
        <Grid item xs={12} md={5}>
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>📈 30-Day Performance Trend</Typography>
            {data ? <Line data={lineData} options={{ plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, max: 100 } } }} /> : <Typography variant="caption" color="text.secondary">No data</Typography>}
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Floating settings */}
      <Tooltip title="Settings" placement="left">
        <IconButton color="primary" sx={{ position: 'fixed', right: 16, bottom: 16, backdropFilter: 'blur(6px)', background: theme => alpha(theme.palette.background.paper, 0.6) }}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}


