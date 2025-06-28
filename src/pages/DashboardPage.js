// src/pages/DashboardPage.js
import { Box, Typography, Paper, CircularProgress, Alert, useTheme, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';

import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';

import DashboardControls from '../components/dashboard/DashboardControls';
import OverallStatsCards from '../components/dashboard/OverallStatsCards';
import SubjectAveragesChart from '../components/dashboard/SubjectAveragesChart';
import DashboardActivityChart from '../components/dashboard/DashboardActivityChart';
import SubjectPerformanceGrid from '../components/dashboard/SubjectPerformanceGrid';
import GenerateReportButton from '../components/dashboard/GenerateReportButton';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale, Title, Tooltip, Legend);

function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser, isLoadingAuth } = useAuth();
  const DASHBOARD_ACCENT_COLOR = theme.palette.dashboardAccent?.main || theme.palette.grey[700];

  const {
    userResults,
    allSubjects,
    isLoadingData,
    error,
    timeFrequency,
    isGeneratingPdf,
    processedStats,
    subjectAverageScoreChartOptions,
    activityChartRef,
    subjectAveragesChartRef,
    fetchDashboardData,
    handleTimeFrequencyChange,
    handleGenerateReport,
  } = useDashboard(currentUser);

  if (isLoadingAuth) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress sx={{ color: DASHBOARD_ACCENT_COLOR }} /> <Typography sx={{ ml: 2 }}>Authenticating...</Typography>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', mt: 4, mx: 'auto', maxWidth: '600px', borderTop: `4px solid ${DASHBOARD_ACCENT_COLOR}` }}>
        <Typography variant="h6">Please log in to view your dashboard.</Typography>
        <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 2, backgroundColor: DASHBOARD_ACCENT_COLOR }}>
          Login / Register
        </Button>
      </Paper>
    );
  }

  if (isLoadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress sx={{ color: DASHBOARD_ACCENT_COLOR }} /> <Typography sx={{ ml: 2 }}>Loading Dashboard Data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
        <Typography variant="h4" gutterBottom sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', mb: 1, textAlign: 'center' }}>My Dashboard</Typography>
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        <Button onClick={fetchDashboardData} variant="outlined" sx={{ display: 'block', mx: 'auto' }}>Retry Loading Data</Button>
      </Box>
    );
  }

  if (userResults.length === 0 && !isLoadingData && !error) {
    return (
      <Box sx={{ py: 2, px: { xs: 1, sm: 2 }, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', mb: 3 }}>My Dashboard</Typography>
        <DashboardControls timeFrequency={timeFrequency} onTimeFrequencyChange={handleTimeFrequencyChange} />
        <Paper sx={{ p: 3, mt: 2, mx: 'auto', maxWidth: '600px' }}>
          <Typography variant="h6">Welcome, {currentUser.name}!</Typography>
          <Typography sx={{ my: 2 }}>You haven't taken any quizzes yet. Start a quiz to see your progress here!</Typography>
          <Button variant="contained" onClick={() => navigate('/subjects')} sx={{ backgroundColor: DASHBOARD_ACCENT_COLOR }}>
            Explore Quizzes
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 }, width: '100%' }}>
      <DashboardControls
        timeFrequency={timeFrequency}
        onTimeFrequencyChange={handleTimeFrequencyChange}
      />

      <OverallStatsCards
        totalQuizzes={processedStats.totalQuizzes}
        averageScore={processedStats.overallAverageScore}
        accentColor={DASHBOARD_ACCENT_COLOR}
      />

      <Box ref={activityChartRef}>
        <DashboardActivityChart
          activityData={processedStats.activityData}
          timeFrequency={timeFrequency}
        />
      </Box>

      <Box ref={subjectAveragesChartRef}>
        <SubjectAveragesChart
          chartData={processedStats.subjectAverageScoreChartData}
          chartOptions={subjectAverageScoreChartOptions}
        />
      </Box>

      <SubjectPerformanceGrid
        subjectStats={processedStats.subjectStats}
        subjectsToShow={allSubjects}
      />

      <GenerateReportButton
        onGenerate={handleGenerateReport}
        isLoading={isGeneratingPdf}
        accentColor={DASHBOARD_ACCENT_COLOR}
      />
    </Box>
  );
}

export default DashboardPage;