// src/components/dashboard/SubjectAveragesChart.js
import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Bar } from 'react-chartjs-2';
// Chart.js and scales are already registered in DashboardPage.js,
// but for a standalone component, it's good practice to ensure they are,
// or document that the parent must register them.
// For now, we assume parent (DashboardPage) handles registration.

function SubjectAveragesChart({ chartData, chartOptions }) {
  const theme = useTheme();

  return (
    <Paper elevation={3} sx={{ p: {xs:1, sm: 2}, mt: 3, backgroundColor: theme.palette.background.paper }}>
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
}

export default SubjectAveragesChart;