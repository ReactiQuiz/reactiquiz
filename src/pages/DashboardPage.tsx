// src/pages/DashboardPage.tsx
import React from 'react';
import { Box, Alert, Grid } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';

// Import all the dashboard components
import DashboardControls from '../components/dashboard/DashboardControls';
import KpiCards from '../components/dashboard/KpiCards';
import SubjectDifficultyCard from '../components/dashboard/SubjectDifficultyCard';
import DashboardActivityChart from '../components/dashboard/DashboardActivityChart';
import TopicPerformanceList from '../components/dashboard/TopicPerformanceList';
import GenerateReportButton from '../components/dashboard/GenerateReportButton';
import OverallDifficultyCard from '../components/dashboard/OverallDifficultyCard';
import AverageScoreTrendChart from '../components/dashboard/AverageScoreTrendChart';
import DifficultyBreakdownChart from '../components/dashboard/DifficultyBreakdownChart';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import DashboardEmptyState from '../components/dashboard/DashboardEmptyState';

// Register all necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale, Title, Tooltip, Legend, ArcElement);

const DashboardPage: React.FC = () => {
  const { currentUser, isLoadingAuth } = useAuth();
  const {
    allSubjects, isLoadingData, error, timeFrequency, selectedSubject,
    processedStats, activityChartRef, topicPerformanceRef, rollingAverageChartRef,
    handleTimeFrequencyChange, handleSubjectChange, handleGenerateReport, isGeneratingPdf, difficultyBreakdownChartRef
  } = useDashboard();

  // Render the skeleton if either authentication or dashboard data is loading
  if (isLoadingAuth || isLoadingData) {
    return <DashboardSkeleton />;
  }

  // Render an error message if data fetching fails
  if (error) {
    return (<Box sx={{ p: 2 }}><Alert severity="error">{error}</Alert></Box>);
  }

  // Render a welcome/empty state if the user has no quiz results in the selected period
  if (!isLoadingData && (!processedStats || processedStats.totalQuizzes === 0)) {
    return (
      <DashboardEmptyState
        currentUser={currentUser!}
        timeFrequency={timeFrequency}
        onTimeFrequencyChange={handleTimeFrequencyChange}
        allSubjects={allSubjects}
        selectedSubject={selectedSubject}
        onSubjectChange={handleSubjectChange}
      />
    );
  }

  // Render the full dashboard layout with all the data
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
        {/* --- Left Column: KPI Cards --- */}
        <Grid item xs={12} md={5}>
          <KpiCards
            stats={processedStats!}
            isLoading={false}
          />
        </Grid>

        {/* --- Right Column: Difficulty Breakdowns --- */}
        <Grid item xs={12} md={7}>
          {selectedSubject === 'all' ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <OverallDifficultyCard data={processedStats!.overallDifficultyPerformance} />
              </Grid>
              {Object.entries(processedStats!.subjectDifficultyPerformance).map(([key, value]) => (
                <Grid item xs={12} sm={12} md={6} lg={4} xl={4} key={key} sx={{ display: 'flex' }}>
                  <SubjectDifficultyCard
                    subjectKey={key}
                    title={allSubjects.find(s => s.subjectKey === key)?.name || ''}
                    data={value}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <SubjectDifficultyCard
              subjectKey={selectedSubject}
              title={`Difficulty Performance in ${allSubjects.find(s => s.subjectKey === selectedSubject)?.name || ''}`}
              data={processedStats!.subjectDifficultyPerformance[selectedSubject]}
            />
          )}
        </Grid>

        {selectedSubject === 'all' && (
          <Grid item sx={{ width: '100%' }}>
            <Box ref={difficultyBreakdownChartRef}>
              <DifficultyBreakdownChart
                performanceData={processedStats!.subjectDifficultyPerformance}
                subjects={allSubjects}
              />
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box ref={rollingAverageChartRef}>
            <AverageScoreTrendChart
              trendData={processedStats!.rollingAverageData}
              title="30-Day Rolling Average Score"
            />
          </Box>
        </Grid>

        {/* --- Bottom Row: Activity Chart --- */}
        <Grid item xs={12}>
          <Box ref={activityChartRef}>
            <DashboardActivityChart
              activityData={processedStats!.activityData}
              timeFrequency={timeFrequency}
            />
          </Box>
        </Grid>

        {/* --- Conditional Bottom Row: Topic Performance List --- */}
        {selectedSubject !== 'all' && processedStats!.topicPerformance && processedStats!.topicPerformance.length > 0 && (
          <Grid item xs={12}>
            <Box ref={topicPerformanceRef}>
              <TopicPerformanceList
                topics={processedStats!.topicPerformance}
                subjectName={allSubjects.find(s => s.subjectKey === selectedSubject)?.name || ''}
              />
            </Box>
          </Grid>
        )}
      </Grid>

      <GenerateReportButton onGenerate={handleGenerateReport} isLoading={isGeneratingPdf} />
    </Box>
  );
};

export default DashboardPage;
