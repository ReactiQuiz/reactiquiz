// src/pages/DashboardPage.js
import { Box, Typography, Paper, Alert, Grid, Skeleton, Stack } from '@mui/material';
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

// Register all necessary Chart.js components, including the ArcElement for the doughnut chart
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale, Title, Tooltip, Legend, ArcElement);

// A skeleton component that mimics the final layout for a smooth loading experience
const DashboardSkeleton = () => (
    <Box sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 }, width: '100%' }}>
        <Skeleton variant="rectangular" height={90} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={7}>
                <Stack spacing={2}>
                    <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={234} sx={{ borderRadius: 2 }} />
                </Stack>
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

    // Render the skeleton if either authentication or dashboard data is loading
    if (isLoadingAuth || isLoadingData) {
        return <DashboardSkeleton />;
    }
    
    // Render an error message if data fetching fails
    if (error) {
        return ( <Box sx={{ p: 2 }}><Alert severity="error">{error}</Alert></Box> );
    }

    // Render a welcome/empty state if the user has no quiz results in the selected period
    if (!isLoadingData && (!processedStats || processedStats.totalQuizzes === 0)) {
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
              <Typography sx={{ my: 2 }}>You haven't taken any quizzes in the selected period. Start a quiz to see your progress here!</Typography>
              <GenerateReportButton onGenerate={handleGenerateReport} isLoading={isGeneratingPdf} />
            </Paper>
          </Box>
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
                        totalQuizzes={processedStats.totalQuizzes}
                        averageScore={processedStats.overallAverageScore}
                        subjectBreakdowns={processedStats.subjectBreakdowns}
                        isFiltered={selectedSubject !== 'all'}
                    />
                </Grid>
                
                {/* --- Right Column: Difficulty Breakdowns --- */}
                <Grid item xs={12} md={7}>
                    {selectedSubject === 'all' ? (
                        <Stack spacing={2} sx={{height: '100%'}}>
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
                
                {/* --- Bottom Row: Activity Chart --- */}
                <Grid item xs={12}>
                    <Box ref={activityChartRef}>
                        <DashboardActivityChart
                            activityData={processedStats.activityData}
                            timeFrequency={timeFrequency}
                        />
                    </Box>
                </Grid>

                {/* --- Conditional Bottom Row: Topic Performance List --- */}
                {selectedSubject !== 'all' && processedStats.topicPerformance && processedStats.topicPerformance.length > 0 && (
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