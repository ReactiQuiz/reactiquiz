// src/pages/DashboardPage.js
import { Box, Typography, Paper, CircularProgress, Alert, useTheme, Grid, Button, Skeleton } from '@mui/material';
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

const offscreenStyle = {
  position: 'absolute', top: '-9999px', left: '-9999px',
  width: '1000px', height: '600px',
};

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale, Title, Tooltip, Legend);

// --- START OF SKELETON COMPONENT FOR DASHBOARD ---
const DashboardSkeleton = () => (
    <Box sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 }, width: '100%' }}>
        {/* Skeleton for Controls */}
        <Skeleton variant="rectangular" height={90} sx={{ mb: 3, borderRadius: 2 }} />

        {/* Skeleton for top cards, mirroring your exact grid structure */}
        <Grid container spacing={{ xs: '1%', sm: '1%', md: '0.667%', lg: '0.667%', xl: '0.667%' }} sx={{ mb: 3 }}>
            <Grid item width={{ xs: '50%', sm: '50%', md: '25%', lg: '25%', xl: '25%' }}>
                <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item width={{ xs: '50%', sm: '50%', md: '25%', lg: '25%', xl: '25%' }}>
                <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item width={{ xs: '50%', sm: '50%', md: '25%', lg: '25%', xl: '25%' }} mt={{ xs: 2, sm: 2, md: 0 }}>
                <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item width={{ xs: '50%', sm: '50%', md: '25%', lg: '25%', xl: '25%' }} mt={{ xs: 2, sm: 2, md: 0 }}>
                <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 2 }} />
            </Grid>
        </Grid>
        
        {/* Skeleton for the main Activity Chart */}
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
    </Box>
);
// --- END OF SKELETON COMPONENT ---


function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser, isLoadingAuth } = useAuth();
  const {
    allSubjects, isLoadingData, error, timeFrequency, selectedSubject,
    isGeneratingPdf, processedStats, subjectAverageScoreChartOptions,
    activityChartRef, subjectAveragesChartRef, topicPerformanceRef,
    handleTimeFrequencyChange, handleSubjectChange, handleGenerateReport, fetchDashboardData
  } = useDashboard();
  
  const DASHBOARD_ACCENT_COLOR = theme.palette.dashboardAccent?.main || theme.palette.grey[700];

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

  // --- START OF RENDER LOGIC UPDATE ---
  if (isLoadingData) {
    return <DashboardSkeleton />;
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
  
  if (!isLoadingData && !error && (!processedStats || processedStats.totalQuizzes === 0)) {
    return (
      <Box sx={{ py: 2, px: { xs: 1, sm: 2 }, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', mb: 3 }}>My Dashboard</Typography>
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
  // --- END OF RENDER LOGIC UPDATE ---

  // Your final JSX is unchanged, as requested.
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
        xs: '1%', sm: '1%', md: '1%', lg: '1%', xl: '1%'
      }} sx={{ mb: 3 }}>
        <Grid item
          width={{ xs: '50%', sm: '50%', md: '25%', lg: '25%', xl: '25%' }}>
          <Paper sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center', height: '100%', borderTop: `4px solid ${DASHBOARD_ACCENT_COLOR}` }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>Total Quizzes Solved</Typography>
            <Typography variant="h3" sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.5rem' } }}>{processedStats.totalQuizzes}</Typography>
            <Typography variant="caption" color="text.secondary">{selectedSubject !== 'all' ? '(in selected filter)' : '(in selected period)'}</Typography>
          </Paper>
        </Grid>
        <Grid item
          width={{ xs: '50%', sm: '50%', md: '25%', lg: '25%', xl: '25%' }}>
          <Paper sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center', height: '100%', borderTop: `4px solid ${DASHBOARD_ACCENT_COLOR}` }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>Overall Average Score</Typography>
            <Typography variant="h3" sx={{ color: DASHBOARD_ACCENT_COLOR, fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.5rem' } }}>{processedStats.overallAverageScore}%</Typography>
            <Typography variant="caption" color="text.secondary">{selectedSubject !== 'all' ? '(in selected filter)' : '(in selected period)'}</Typography>
          </Paper>
        </Grid>

        {selectedSubject === 'all' && (
          <>
            <Grid item
              width={{ xs: '50%', sm: '50%', md: '25%', lg: '25%', xl: '25%' }}
              mt={{ xs: 2, sm: 2, md: 0, lg: 0, xl: 0 }}>
              <KpiDisplay bestSubject={processedStats.bestSubject} />
            </Grid>
            <Grid item
              width={{ xs: '50%', sm: '50%', md: '25%', lg: '25%', xl: '25%' }}
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