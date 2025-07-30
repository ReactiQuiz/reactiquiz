// src/pages/DashboardPage.js
import { Box, Typography, Paper, Alert, Grid, Skeleton, Stack } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import DashboardControls from '../components/dashboard/DashboardControls';
import KpiCards from '../components/dashboard/KpiCards';
import SubjectDifficultyCard from '../components/dashboard/SubjectDifficultyCard';
import DashboardActivityChart from '../components/dashboard/DashboardActivityChart';
import TopicPerformanceList from '../components/dashboard/TopicPerformanceList';
import GenerateReportButton from '../components/dashboard/GenerateReportButton';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale, Title, Tooltip, Legend);

const DashboardSkeleton = () => (
  <Box sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 }, width: '100%' }}>
    <Skeleton variant="rectangular" height={90} sx={{ mb: 3, borderRadius: 2 }} />
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
        </Stack>
      </Grid>
      <Grid item xs={12} md={8}>
        <Skeleton variant="rectangular" height={316} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  </Box>
);

function DashboardPage() {
  const { currentUser, isLoadingAuth } = useAuth();
  const {
    allSubjects, isLoadingData, error, timeFrequency, selectedSubject,
    processedStats, activityChartRef, topicPerformanceRef,
    handleTimeFrequencyChange, handleSubjectChange, handleGenerateReport, isGeneratingPdf
  } = useDashboard();

  const [kpiExpanded, setKpiExpanded] = useState(false);

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
        <Grid item xs={12} md={4}>
          <KpiCards
            totalQuizzes={processedStats.totalQuizzes}
            averageScore={processedStats.overallAverageScore}
            subjectBreakdowns={processedStats.subjectBreakdowns}
            isFiltered={selectedSubject !== 'all'}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedSubject === 'all' ? (
            <Stack spacing={2}>
              <OverallDifficultyCard data={processedStats.overallDifficultyPerformance} />
              <Grid container spacing={2}>
                {Object.entries(processedStats.subjectDifficultyPerformance).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <SubjectDifficultyCard
                      subjectKey={key}
                      title={allSubjects.find(s => s.subjectKey === key)?.name || ''}
                      data={value}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          ) : (
            <SubjectDifficultyCard
              subjectKey={selectedSubject}
              title={`Difficulty Performance in ${allSubjects.find(s => s.subjectKey === selectedSubject)?.name || ''}`}
              data={processedStats.subjectDifficultyPerformance[selectedSubject]}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <Box ref={activityChartRef}>
            <DashboardActivityChart
              activityData={processedStats.activityData}
              timeFrequency={timeFrequency}
            />
          </Box>
        </Grid>

        {selectedSubject !== 'all' && processedStats.topicPerformance.length > 0 && (
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