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
  const navigate = useNavigate();
  const { currentUser, isLoadingAuth } = useAuth();
  const {
    allSubjects, isLoadingData, error, timeFrequency, selectedSubject,
    processedStats, activityChartRef, topicPerformanceRef,
    handleTimeFrequencyChange, handleSubjectChange, handleGenerateReport, isGeneratingPdf
  } = useDashboard();

  if (isLoadingAuth || isLoadingData) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (<Box sx={{ p: 2 }}><Alert severity="error">{error}</Alert></Box>);
  }

  if (!isLoadingData && processedStats.totalQuizzes === 0) {
    return (
      <Box sx={{ py: 2, px: { xs: 1, sm: 2 }, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>My Dashboard</Typography>
        <DashboardControls
          timeFrequency={timeFrequency}
          onTimeFrequencyChange={handleTimeFrequencyChange}
          allSubjects={allSubjects}
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
        />
        <Paper sx={{ p: 3, mt: 2, mx: 'auto', maxWidth: '600px' }}>
          <Typography variant="h6">Welcome, {currentUser.name}!</Typography>
          <Typography sx={{ my: 2 }}>You haven't taken any quizzes yet. Start a quiz to see your progress!</Typography>
          <Box mt={2}>
            <GenerateReportButton onGenerate={handleGenerateReport} isLoading={isGeneratingPdf} />
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 }, width: '100%' }}>
      <DashboardControls
        timeFrequency={timeFrequency}
        onTimeFrequencyChange={handleTimeFrequencyChange}
        allSubjects={allSubjects}
        selectedSubject={selectedSubject}
        onSubjectChange={handleSubjectChange}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <KpiCards
                totalQuizzes={processedStats.totalQuizzes}
                averageScore={processedStats.overallAverageScore}
                subjectBreakdowns={processedStats.subjectBreakdowns}
                isFiltered={selectedSubject !== 'all'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* Intentionally empty for the 2x1 layout of KpiCards */}
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <DifficultyPerformanceCard
            data={processedStats.difficultyPerformance}
            title={selectedSubject === 'all' ? 'Difficulty Performance (All Subjects)' : `Difficulty Performance in ${allSubjects.find(s => s.subjectKey === selectedSubject)?.name || ''}`}
          />
        </Grid>

        <Grid item xs={12}>
          <Box ref={activityChartRef}>
            <DashboardActivityChart
              activityData={processedStats.activityData}
              timeFrequency={timeFrequency}
            />
          </Box>
        </Grid>

        {selectedSubject !== 'all' && (
          <Grid item xs={12}>
            <Box ref={topicPerformanceRef}>
              <TopicPerformanceList
                topics={processedStats.topicPerformance}
                subjectName={allSubjects.find(s => s.subjectKey === selectedSubject)?.name || ''}
              />
            </Box>
          </Grid>
        )}
      </Grid>

      <GenerateReportButton onGenerate={handleGenerateReport} isLoading={isGeneratingPdf} />
    </Box>
  );
}

export default DashboardPage;