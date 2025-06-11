// src/pages/DashboardPage.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress, Alert, useTheme,
  Button, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { subDays, format, startOfDay, parseISO, isValid, eachDayOfInterval, min } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import apiClient from '../api/axiosInstance';
import { subjectAccentColors } from '../theme';
import DashboardActivityChart from '../components/DashboardActivityChart';
import SubjectPerformanceGrid from '../components/SubjectPerformanceGrid';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const subjectsToShow = [
  { key: 'physics', name: 'Physics', color: subjectAccentColors.physics },
  { key: 'chemistry', name: 'Chemistry', color: subjectAccentColors.chemistry },
  { key: 'biology', name: 'Biology', color: subjectAccentColors.biology },
  { key: 'mathematics', name: 'Mathematics', color: subjectAccentColors.mathematics },
  { key: 'gk', name: 'General Knowledge', color: subjectAccentColors.gk },
  { key: 'homibhabha', name: 'Homi Bhabha Prep', color: (theme) => theme.palette.secondary.main }
];

const timeFrequencyOptions = [
  { value: 7, label: 'Last 7 Days' },
  { value: 30, label: 'Last 30 Days' },
  { value: 90, label: 'Last 90 Days' },
  { value: 365, label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

function DashboardPage({ currentUser }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const DASHBOARD_ACCENT_COLOR = theme.palette.dashboardAccent?.main || theme.palette.grey[700];

  const [userResults, setUserResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFrequency, setTimeFrequency] = useState(30);

  const handleTimeFrequencyChange = (event) => {
    setTimeFrequency(event.target.value);
  };

  const processedStats = useMemo(() => {
    if (!userResults || userResults.length === 0) {
      return { totalQuizzes: 0, overallAverageScore: 0, subjectStats: {}, activityData: { labels: [], datasets: [] }, subjectAverageScoreChartData: { labels: [], datasets: [] } };
    }

    const today = startOfDay(new Date());
    let startDate;
    let endDate = today;
    let resultsForPeriod = userResults;

    if (timeFrequency === 'all') {
        const allDates = userResults.map(r => parseISO(r.timestamp)).filter(isValid);
        startDate = allDates.length > 0 ? startOfDay(min(allDates)) : today;
    } else {
      startDate = startOfDay(subDays(today, Number(timeFrequency) - 1));
      resultsForPeriod = userResults.filter(r => {
        const resultDate = parseISO(r.timestamp);
        return isValid(resultDate) && resultDate >= startDate && resultDate <= endDate;
      });
    }

    const totalQuizzes = resultsForPeriod.length;
    const validPercentages = resultsForPeriod.map(r => parseFloat(r.percentage)).filter(p => !isNaN(p));
    const overallAverageScore = validPercentages.length > 0 ? Math.round(validPercentages.reduce((acc, p) => acc + p, 0) / validPercentages.length) : 0;
    
    const subjectStats = {};
    subjectsToShow.forEach(subj => {
      const subjectKey = subj.key.toLowerCase();
      const resultsForSubject = resultsForPeriod.filter(r => r.subject && r.subject.trim().toLowerCase() === subjectKey);
      const subjectValidPercentages = resultsForSubject.map(r => parseFloat(r.percentage)).filter(p => !isNaN(p));
      subjectStats[subjectKey] = {
        count: resultsForSubject.length,
        average: subjectValidPercentages.length > 0 ? Math.round(subjectValidPercentages.reduce((acc, p) => acc + p, 0) / subjectValidPercentages.length) : 0,
        name: subj.name,
        color: typeof subj.color === 'function' ? subj.color(theme) : subj.color
      };
    });

    const activityCountsByDay = {};
    resultsForPeriod.forEach(r => {
      const resultDate = parseISO(r.timestamp);
      if (isValid(resultDate)) {
        const dayKey = format(startOfDay(resultDate), 'yyyy-MM-dd');
        activityCountsByDay[dayKey] = (activityCountsByDay[dayKey] || 0) + 1;
      }
    });
    let chartLabels = [];
    if (startDate && endDate && startDate <= endDate) {
        chartLabels = eachDayOfInterval({ start: startDate, end: endDate }).map(date => format(date, 'yyyy-MM-dd'));
    }
    const chartDatasetData = chartLabels.map(dayKey => activityCountsByDay[dayKey] || 0);
    const activityData = {
      labels: chartLabels,
      datasets: [{
        label: 'Quizzes Taken', data: chartDatasetData, fill: true,
        backgroundColor: alpha(theme.palette.primary.main, 0.3), borderColor: theme.palette.primary.main,
        tension: 0.1, pointBackgroundColor: theme.palette.primary.main, pointBorderColor: theme.palette.common.white,
        pointHoverBackgroundColor: theme.palette.common.white, pointHoverBorderColor: theme.palette.primary.dark,
      }],
    };

    const statsWithData = subjectsToShow.map(s => subjectStats[s.key.toLowerCase()]).filter(s => s && s.count > 0);
    const subjectAverageScoreChartData = {
      labels: statsWithData.map(stat => stat.name),
      datasets: [{
        label: 'Average Score (%)', data: statsWithData.map(stat => stat.average),
        backgroundColor: statsWithData.map(stat => alpha(stat.color || theme.palette.grey[500], 0.7)),
        borderColor: statsWithData.map(stat => stat.color || theme.palette.grey[500]),
        borderWidth: 1,
      }],
    };

    return { totalQuizzes, overallAverageScore, subjectStats, activityData, subjectAverageScoreChartData };
  }, [userResults, timeFrequency, theme]);

  const subjectAverageScoreChartOptions = useMemo(() => ({
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { callbacks: { label: (context) => `Average: ${context.parsed.x}%` } }
    },
    scales: {
      x: { beginAtZero: true, max: 100, ticks: { color: theme.palette.text.secondary, callback: (value) => value + "%" }, grid: { color: alpha(theme.palette.text.secondary, 0.1) }, title: { display: true, text: 'Average Score (%)', color: theme.palette.text.secondary } },
      y: { ticks: { color: theme.palette.text.secondary }, grid: { display: false } }
    }
  }), [theme.palette.text.secondary]);

  const fetchUserResults = useCallback(async () => {
    if (!currentUser || !currentUser.id) { setIsLoading(false); return; }
    setIsLoading(true); setError('');
    try {
      const response = await apiClient.get(`/api/results?userId=${currentUser.id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      if (Array.isArray(response.data)) {
        setUserResults(response.data.map(r => ({ ...r, percentage: parseFloat(r.percentage) })).filter(r => !isNaN(r.percentage)));
      } else {
        setUserResults([]); setError('Received invalid data format for your results.');
      }
    } catch (err) {
      setUserResults([]); setError(`Failed to load results: ${err.response?.data?.message || err.message}`);
    } finally { setIsLoading(false); }
  }, [currentUser]);

  useEffect(() => { fetchUserResults(); }, [fetchUserResults]);

  if (!currentUser) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', mt: 4, mx: 'auto', maxWidth: '600px', borderTop: `4px solid ${DASHBOARD_ACCENT_COLOR}` }}>
        <Typography variant="h6">Please log in to view your dashboard.</Typography>
        <Button variant="contained" onClick={() => navigate('/account')} sx={{ mt: 2, backgroundColor: DASHBOARD_ACCENT_COLOR }}>
          Login / Register
        </Button>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress sx={{ color: DASHBOARD_ACCENT_COLOR }} />
        <Typography sx={{ ml: 2 }}>Loading Dashboard Data...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (userResults.length === 0 && !isLoading && !error) {
    return (
      <Box sx={{ py: 2, px: { xs: 1, sm: 2 }, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', mb: 3 }}>
          My Dashboard
        </Typography>
        <Paper sx={{ p: 3, mt: 2, mx: 'auto', maxWidth: '600px' }}>
          <Typography variant="h6">Welcome, {currentUser.name}!</Typography>
          <Typography sx={{ my: 2 }}>
            You haven't taken any quizzes yet. Start a quiz to see your progress here!
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ backgroundColor: DASHBOARD_ACCENT_COLOR }}>
            Explore Quizzes
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <Typography variant="h6" color="text.primary">Dashboard Controls</Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="time-freq-main-label">Time Period</InputLabel>
                <Select
                    labelId="time-freq-main-label"
                    value={timeFrequency}
                    label="Time Period"
                    onChange={handleTimeFrequencyChange}
                >
                    {timeFrequencyOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
              </FormControl>
          </Box>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'left', color: 'text.secondary' }}>
              Results take up to 24 hours to be calculated in the dashboard.
          </Typography>
      </Paper>
      
      <Paper sx={{ p: {xs: 1, sm: 2}, mb: 3, backgroundColor: alpha(theme.palette.background.default, 0.3) }}>
        <Grid container>
          <Grid item sx={{ width: { xs: '100%', sm: '47.5%'} }}>
            <Paper sx={{ p: 2.5, textAlign: 'center', height: '100%', borderLeft: `4px solid ${DASHBOARD_ACCENT_COLOR}` }}>
              <Typography variant="h6" color="text.secondary">Total Quizzes Solved</Typography>
              <Typography variant="h3" sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold' }}>
                {processedStats.totalQuizzes}
              </Typography>
              <Typography variant="caption" color="text.secondary">(in selected period)</Typography>
            </Paper>
          </Grid>
          <Grid item sx={{ width: { xs: '0%', sm: '5%'} }} />
          <Grid item sx={{ width: { xs: '100%', sm: '47.5%'}, mt: { xs: 2, sm: 0 } }}>
            <Paper sx={{ p: 2.5, textAlign: 'center', height: '100%', borderLeft: `4px solid ${DASHBOARD_ACCENT_COLOR}` }}>
              <Typography variant="h6" color="text.secondary">Overall Average Score</Typography>
              <Typography variant="h3" sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold' }}>
                {processedStats.overallAverageScore}%
              </Typography>
              <Typography variant="caption" color="text.secondary">(in selected period)</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      <DashboardActivityChart activityData={processedStats.activityData} timeFrequency={timeFrequency} />
      
      <Paper elevation={3} sx={{ p: {xs:1, sm: 2}, mt: 3, backgroundColor: theme.palette.background.paper }}>
        <Typography variant="h6" sx={{color: theme.palette.text.primary, ml: {xs:1, sm:0}, mb: 2}}>Average Score by Subject</Typography>
        <Box sx={{ height: `${Math.max(300, processedStats.subjectAverageScoreChartData.labels.length * 40)}px`, width: '100%' }}>
          {processedStats.subjectAverageScoreChartData.labels.length > 0 ? (
            <Bar key={timeFrequency} options={subjectAverageScoreChartOptions} data={processedStats.subjectAverageScoreChartData} />
          ) : (
            <Typography sx={{textAlign: 'center', color: theme.palette.text.secondary, pt:5}}>
              No subject data with solved quizzes for the selected period.
            </Typography>
          )}
        </Box>
      </Paper>
      
      <SubjectPerformanceGrid subjectStats={processedStats.subjectStats} subjectsToShow={subjectsToShow} />

    </Box>
  );
}

export default DashboardPage;