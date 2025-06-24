// src/pages/DashboardPage.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert, useTheme, Button
} from '@mui/material'; // Removed Grid as it's handled by sub-components if needed there
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { subDays, format, startOfDay, parseISO, isValid, eachDayOfInterval, min } from 'date-fns';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale, Title, Tooltip, Legend
} from 'chart.js';
import 'chartjs-adapter-date-fns';

import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { subjectAccentColors } from '../theme';

// Import new dashboard components
import DashboardControls from '../components/dashboard/DashboardControls';
import OverallStatsCards from '../components/dashboard/OverallStatsCards';
import SubjectAveragesChart from '../components/dashboard/SubjectAveragesChart';
// Existing components
import DashboardActivityChart from '../components/dashboard/DashboardActivityChart';
import SubjectPerformanceGrid from '../components/dashboard/SubjectPerformanceGrid';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale, Title, Tooltip, Legend
);

const subjectsToShow = [ // This can be moved to a config file or kept here
  { key: 'physics', name: 'Physics', color: subjectAccentColors.physics },
  { key: 'chemistry', name: 'Chemistry', color: subjectAccentColors.chemistry },
  { key: 'biology', name: 'Biology', color: subjectAccentColors.biology },
  { key: 'mathematics', name: 'Mathematics', color: subjectAccentColors.mathematics },
  { key: 'gk', name: 'General Knowledge', color: subjectAccentColors.gk },
  { key: 'homibhabha', name: 'Homi Bhabha Prep', color: (theme) => theme.palette.secondary.main } // Example of using theme function
];


function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser, isLoadingAuth } = useAuth();
  const DASHBOARD_ACCENT_COLOR = theme.palette.dashboardAccent?.main || theme.palette.grey[700];

  const [userResults, setUserResults] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [timeFrequency, setTimeFrequency] = useState(30); // Default to last 30 days

  const handleTimeFrequencyChange = (event) => {
    setTimeFrequency(event.target.value);
  };

  const processedStats = useMemo(() => {
    if (!userResults || userResults.length === 0) {
      return {
        totalQuizzes: 0,
        overallAverageScore: 0,
        subjectStats: {}, // Ensure this is an object for SubjectPerformanceGrid
        activityData: { labels: [], datasets: [] },
        subjectAverageScoreChartData: { labels: [], datasets: [] }
      };
    }

    const today = startOfDay(new Date());
    let startDate;
    let endDate = today; // End date is always today for "last X days" or "all time up to today"
    let resultsForPeriod = userResults;

    if (timeFrequency === 'all') {
      const allDates = userResults.map(r => parseISO(r.timestamp)).filter(isValid);
      startDate = allDates.length > 0 ? startOfDay(min(allDates)) : today;
    } else {
      startDate = startOfDay(subDays(today, Number(timeFrequency) - 1));
      // Filter results that fall within the startDate and endDate
      resultsForPeriod = userResults.filter(r => {
        const resultDate = parseISO(r.timestamp);
        return isValid(resultDate) && resultDate >= startDate && resultDate <= endDate;
      });
    }

    const totalQuizzes = resultsForPeriod.length;
    const validPercentages = resultsForPeriod.map(r => parseFloat(r.percentage)).filter(p => !isNaN(p));
    const overallAverageScore = validPercentages.length > 0
      ? Math.round(validPercentages.reduce((acc, p) => acc + p, 0) / validPercentages.length)
      : 0;

    const subjectStats = {};
    subjectsToShow.forEach(subjConfig => {
      const subjectKeyLower = subjConfig.key.toLowerCase();
      const resultsForSubject = resultsForPeriod.filter(r => r.subject && r.subject.trim().toLowerCase() === subjectKeyLower);
      const subjectValidPercentages = resultsForSubject.map(r => parseFloat(r.percentage)).filter(p => !isNaN(p));
      subjectStats[subjectKeyLower] = {
        count: resultsForSubject.length,
        average: subjectValidPercentages.length > 0
          ? Math.round(subjectValidPercentages.reduce((acc, p) => acc + p, 0) / subjectValidPercentages.length)
          : 0,
        name: subjConfig.name,
        color: typeof subjConfig.color === 'function' ? subjConfig.color(theme) : subjConfig.color
      };
    });

    const activityCountsByDay = {};
    resultsForPeriod.forEach(r => {
      const resultDate = parseISO(r.timestamp);
      if (isValid(resultDate)) {
        const dayKey = format(startOfDay(resultDate), 'yyyy-MM-dd'); // Group by day
        activityCountsByDay[dayKey] = (activityCountsByDay[dayKey] || 0) + 1;
      }
    });

    let chartLabels = [];
    // Ensure startDate is valid and not after endDate before creating interval
    if (startDate && endDate && startDate <= endDate) {
      chartLabels = eachDayOfInterval({ start: startDate, end: endDate }).map(date => format(date, 'yyyy-MM-dd'));
    }

    const chartDatasetData = chartLabels.map(dayKey => activityCountsByDay[dayKey] || 0);
    const activityData = {
      labels: chartLabels, // These are date strings 'yyyy-MM-dd'
      datasets: [{
        label: 'Quizzes Taken',
        data: chartDatasetData,
        fill: true,
        backgroundColor: alpha(theme.palette.primary.main, 0.3),
        borderColor: theme.palette.primary.main,
        tension: 0.1,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: theme.palette.common.white,
        pointHoverBackgroundColor: theme.palette.common.white,
        pointHoverBorderColor: theme.palette.primary.dark,
      }],
    };

    const statsWithData = subjectsToShow
      .map(s => subjectStats[s.key.toLowerCase()])
      .filter(stat => stat && stat.count > 0); // Only include subjects with data

    const subjectAverageScoreChartData = {
      labels: statsWithData.map(stat => stat.name),
      datasets: [{
        label: 'Average Score (%)',
        data: statsWithData.map(stat => stat.average),
        backgroundColor: statsWithData.map(stat => alpha(stat.color || theme.palette.grey[500], 0.7)),
        borderColor: statsWithData.map(stat => stat.color || theme.palette.grey[500]),
        borderWidth: 1,
      }],
    };

    return { totalQuizzes, overallAverageScore, subjectStats, activityData, subjectAverageScoreChartData };
  }, [userResults, timeFrequency, theme]);

  const subjectAverageScoreChartOptions = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }, // Title is handled by component's Typography
      tooltip: { callbacks: { label: (context) => `Average: ${context.parsed.x}%` } }
    },
    scales: {
      x: {
        beginAtZero: true, max: 100,
        ticks: { color: theme.palette.text.secondary, callback: (value) => value + "%" },
        grid: { color: alpha(theme.palette.text.secondary, 0.1) },
        title: { display: true, text: 'Average Score (%)', color: theme.palette.text.secondary }
      },
      y: {
        ticks: { color: theme.palette.text.secondary },
        grid: { display: false }
      }
    }
  }), [theme.palette.text.secondary]);

  const fetchUserResults = useCallback(async () => {
    if (!currentUser || !currentUser.id) {
      setIsLoadingData(false);
      setUserResults([]);
      return;
    }
    setIsLoadingData(true); setError('');
    try {
      const response = await apiClient.get(`/api/results?userId=${currentUser.id}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      if (Array.isArray(response.data)) {
        setUserResults(response.data.map(r => ({ ...r, percentage: parseFloat(r.percentage) })).filter(r => !isNaN(r.percentage)));
      } else {
        setUserResults([]); setError('Received invalid data format for your results.');
      }
    } catch (err) {
      setUserResults([]); setError(`Failed to load results: ${err.response?.data?.message || err.message}`);
    } finally { setIsLoadingData(false); }
  }, [currentUser]);

  useEffect(() => {
    if (!isLoadingAuth && currentUser) { // Fetch only if auth check complete and user exists
      fetchUserResults();
    } else if (!isLoadingAuth && !currentUser) { // Auth check complete, no user
      setIsLoadingData(false); // Not loading data if no user
      setUserResults([]); // Clear any old results
    }
  }, [fetchUserResults, isLoadingAuth, currentUser]);

  if (isLoadingAuth) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress sx={{ color: DASHBOARD_ACCENT_COLOR }} />
        <Typography sx={{ ml: 2 }}>Authenticating...</Typography>
      </Box>
    );
  }

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

  if (isLoadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress sx={{ color: DASHBOARD_ACCENT_COLOR }} />
        <Typography sx={{ ml: 2 }}>Loading Dashboard Data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
        <Typography variant="h4" gutterBottom sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
          My Dashboard
        </Typography>
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        <Button onClick={fetchUserResults} variant="outlined" sx={{ display: 'block', mx: 'auto' }}>Retry Loading Data</Button>
      </Box>
    );
  }

  // If no results and not loading and no error (e.g., new user)
  if (userResults.length === 0 && !isLoadingData && !error) {
    return (
      <Box sx={{ py: 2, px: { xs: 1, sm: 2 }, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', mb: 3 }}>
          My Dashboard
        </Typography>
        <DashboardControls timeFrequency={timeFrequency} onTimeFrequencyChange={handleTimeFrequencyChange} />
        <Paper sx={{ p: 3, mt: 2, mx: 'auto', maxWidth: '600px' }}>
          <Typography variant="h6">Welcome, {currentUser.name}!</Typography>
          <Typography sx={{ my: 2 }}>
            You haven't taken any quizzes yet for the selected period. Start a quiz to see your progress here!
          </Typography>
          <Button variant="contained" onClick={() => navigate('/subjects')} sx={{ backgroundColor: DASHBOARD_ACCENT_COLOR }}>
            Explore Quizzes
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 }, width: '100%' }}> {/* Reduced top padding */}
      <Typography variant="h4" gutterBottom sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
        My Dashboard
      </Typography>
      <DashboardControls
        timeFrequency={timeFrequency}
        onTimeFrequencyChange={handleTimeFrequencyChange}
      />

      <Box sx={{width:'100%'}}>
        <OverallStatsCards
          totalQuizzes={processedStats.totalQuizzes}
          averageScore={processedStats.overallAverageScore}
          accentColor={DASHBOARD_ACCENT_COLOR}
        />
      </Box>
      <DashboardActivityChart
        activityData={processedStats.activityData}
        timeFrequency={timeFrequency} // Pass timeFrequency for x-axis unit adjustment
      />

      <SubjectAveragesChart
        chartData={processedStats.subjectAverageScoreChartData}
        chartOptions={subjectAverageScoreChartOptions} // Pass pre-calculated options
      />

      <SubjectPerformanceGrid
        subjectStats={processedStats.subjectStats}
        subjectsToShow={subjectsToShow} // Pass the config for which subjects to show
      />
    </Box>
  );
}

export default DashboardPage;