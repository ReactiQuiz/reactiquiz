// src/components/dashboard/SubjectAveragesChart.tsx
import React, { forwardRef } from 'react'; // <-- 1. Import forwardRef
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Bar } from 'react-chartjs-2';

type ChartData = { labels: string[]; datasets: Array<{ label: string; data: number[]; backgroundColor?: string[]; borderColor?: string; borderWidth?: number; }> };
type ChartOptions = any;

// 2. Wrap the component definition in forwardRef
const SubjectAveragesChart = forwardRef<HTMLDivElement, { chartData?: ChartData; chartOptions?: ChartOptions }>(
  ({ chartData, chartOptions }, ref) => {
  const theme = useTheme();

  return (
    // 3. Attach the forwarded ref to the root Paper element
    <Paper ref={ref} elevation={3} sx={{ p: {xs:1, sm: 2}, mt: 3, backgroundColor: theme.palette.background.paper }}>
      <Typography variant="h6" sx={{color: theme.palette.text.primary, ml: {xs:1, sm:0}, mb: 2}}>
        Average Score by Subject
      </Typography>
      <Box sx={{ height: `${Math.max(300, (chartData?.labels?.length || 0) * 40)}px`, width: '100%' }}>
        {chartData && chartData.labels && chartData.labels.length > 0 ? (
          <Bar options={chartOptions} data={chartData} />
        ) : (
          <Typography sx={{textAlign: 'center', color: theme.palette.text.secondary, pt:5}}>
            No subject data with solved quizzes for the selected period.
          </Typography>
        )}
      </Box>
    </Paper>
  );
});

export default SubjectAveragesChart;