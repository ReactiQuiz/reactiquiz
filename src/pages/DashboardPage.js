// src/pages/DashboardPage.js
import { Box, Typography, Paper, CircularProgress, Alert, useTheme, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';

import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';

// Import all the dashboard components
import DashboardControls from '../components/dashboard/DashboardControls';
import KpiDisplay from '../components/dashboard/KpiCards';
import DashboardActivityChart from '../components/dashboard/DashboardActivityChart';
import SubjectAveragesChart from '../components/dashboard/SubjectAveragesChart';
import TopicPerformanceList from '../components/dashboard/TopicPerformanceList';
import GenerateReportButton from '../components/dashboard/GenerateReportButton';

// This style helper is correct and remains.
const offscreenStyle = {
  position: 'absolute',
  top: '-9999px',
  left: '-9999px',
  width: '1000px',
  height: '600px',
};

// Register ChartJS modules. This is also correct.
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale, Title, Tooltip, Legend);

function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // --- START OF FIX ---
  // 1. Hooks are called correctly inside the component. The top-level call has been removed.
  const { currentUser, isLoadingAuth } = useAuth();
  
  // 2. The useDashboard hook is now self-sufficient and doesn't need props.
  const {
    allSubjects,
    isLoadingData,
    error,
    timeFrequency,
    selectedSubject,
    isGeneratingPdf,
    processedStats,
    subjectAverageScoreChartOptions,
    activityChartRef,
    subjectAveragesChartRef,
    topicPerformanceRef,
    handleTimeFrequencyChange,
    handleSubjectChange,
    handleGenerateReport,
    fetchDashboardData, // fetchDashboardData can be kept for the "Retry" button
  } = useDashboard();
  // --- END OF FIX ---

  const DASHBOARD_ACCENT_COLOR = theme.palette.dashboardAccent?.main || theme.palette.grey[700];

  // This logic correctly handles the initial loading of the user's authentication status.
  if (isLoadingAuth) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress sx={{ color: DASHBOARD_ACCENT_COLOR }} /> <Typography sx={{ ml: 2 }}>Authenticating...</Typography>
      </Box>
    );
  }

  // This logic correctly handles the case where no user is logged in.
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

  // This logic correctly handles the loading state for dashboard-specific data.
  if (isLoadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress sx={{ color: DASHBOARD_ACCENT_COLOR }} /> <Typography sx={{ ml: 2 }}>Loading Dashboard Data...</Typography>
      </Box>
    );
  }

  // This logic correctly handles API errors.
  if (error) {
    return (
      <Box sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
        <Typography variant="h4" gutterBottom sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', mb: 1, textAlign: 'center' }}>My Dashboard</Typography>
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        <Button onClick={fetchDashboardData} variant="outlined" sx={{ display: 'block', mx: 'auto' }}>Retry Loading Data</Button>
      </Box>
    );
  }
  
  // --- START OF FIX ---
  // 3. This condition is now more robust. It checks the final processed data.
  // It only shows the "Welcome" message after loading is complete and if there are truly no results to show.
  if (!isLoadingData && !error && processedStats.totalQuizzes === 0) {
    return (
      <Box sx={{ py: 2, px: { xs: 1, sm: 2 }, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', mb: 3 }}>My Dashboard</Typography>
        {/* Pass allSubjects here for the filter dropdown to still render */}
        <DashboardControls 
            timeFrequency={timeFrequency} 
            onTimeFrequencyChange={handleTimeFrequencyChange}
            allSubjects={allSubjects}
            selectedSubject={selectedSubject}
            onSubjectChange={handleSubjectChange}
        />
        <Paper sx={{ p: 3, mt: 2, mx: 'auto', maxWidth: '600px' }}>
          <Typography variant="h6">Welcome, {currentUser.name}!</Typography>
          <Typography sx={{ my: 2 }}>You haven't taken any quizzes in the selected period. Start a quiz to see your progress here!</Typography>
          <Button variant="contained" onClick={() => navigate('/subjects')} sx={{ backgroundColor: DASHBOARD_ACCENT_COLOR }}>
            Explore Quizzes
          </Button>
        </Paper>
      </Box>
    );
  }
  // --- END OF FIX ---

  // The entire JSX return below is IDENTICAL to what you provided,
  // ensuring no layout, width, or spacing changes have been made.
  // It will now receive the correct data from the fixed hook logic above.
  return (
    <Box sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 }, width: '100%' }}>
      <DashboardControls
        timeFrequency={timeFrequency}
        onTimeFrequencyChange={handleTimeFrequencyChange}
        allSubjects={allSubjects}
        selectedSubject={selectedSubject}
        onSubjectChange={handleSubjectChange}
      />

      <Grid container spacing={{
        xs: '1%', sm: '1%', md: '0.667%', lg: '0.667%', xl: '0.667%'
      }} sx={{ mb: 3 }}>
        <Grid item
          width={{ xs: '49.5%', sm: '49.5%', md: '24.5%', lg: '24.5%', xl: '24.5%' }}>
          <Paper sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center', height: '100%', borderTop: `4px solid ${DASHBOARD_ACCENT_COLOR}` }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
              Total Quizzes Solved
            </Typography>
            <Typography variant="h3" sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
              {processedStats.totalQuizzes}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedSubject !== 'all' ? '(in selected filter)' : '(in selected period)'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item
          width={{ xs: '49.5%', sm: '49.5%', md: '24.5%', lg: '24.5%', xl: '24.5%' }}>
          <Paper sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center', height: '100%', borderTop: `4px solid ${DASHBOARD_ACCENT_COLOR}` }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
              Overall Average Score
            </Typography>
            <Typography variant="h3" sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
              {processedStats.overallAverageScore}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedSubject !== 'all' ? '(in selected filter)' : '(in selected period)'}
            </Typography>
          </Paper>
        </Grid>

        {selectedSubject === 'all' && (
          <>
            <Grid item
              width={{ xs: '49.5%', sm: '49.5%', md: '24.5%', lg: '24.5%', xl: '24.5%' }}
              mt={{ xs: 2, sm: 2, md: 0, lg: 0, xl: 0 }}>
              <KpiDisplay bestSubject={processedStats.bestSubject} />
            </Grid>
            <Grid item
              width={{ xs: '49.5%', sm: '49.5%', md: '24.5%', lg: '24.5%', xl: '24.5%' }}
              mt={{ xs: 2, sm: 2, md: 0, lg: 0, xl: 0 }}>
              <KpiDisplay weakestSubject={processedStats.weakestSubject} />
            </Grid>
          </>
        )}
      </Grid>
      
      <Box ref={topicPerformanceRef}>
        {selectedSubject !== 'all' && (
          <TopicPerformanceList
            topics={processedStats.topicPerformance}
            subjectName={allSubjects.find(s => s.subjectKey === selectedSubject)?.name || ''}
          />
        )}
      </Box>

      <Box ref={activityChartRef}>
        <DashboardActivityChart
          activityData={processedStats.activityData}
          timeFrequency={timeFrequency}
        />
      </Box>
      
      <Box ref={subjectAveragesChartRef} sx={selectedSubject === 'all' ? {} : offscreenStyle}>
        <SubjectAveragesChart
          chartData={processedStats.subjectAverageScoreChartData}
          chartOptions={subjectAverageScoreChartOptions}
        />
      </Box>

      <GenerateReportButton
        onGenerate={handleGenerateReport}
        isLoading={isGeneratingPdf}
        accentColor={DASHBOARD_ACCENT_COLOR}
      />
    </Box >
  );
}

export default DashboardPage;