// src/components/dashboard/DifficultyBreakdownChart.js
import React, { forwardRef } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';

const DifficultyBreakdownChart = forwardRef(({ performanceData, subjects }, ref) => {
  const theme = useTheme();
  const { getColor } = useSubjectColors();

  const labels = ['Easy', 'Medium', 'Hard'];

  const datasets = Object.keys(performanceData)
    .map(subjectKey => {
      const subjectInfo = subjects.find(s => s.subjectKey === subjectKey);
      if (!subjectInfo) return null;

      const subjectData = performanceData[subjectKey];
      const subjectColor = getColor(subjectKey);

      return {
        label: subjectInfo.name,
        data: [
          subjectData.easy.average,
          subjectData.medium.average,
          subjectData.hard.average,
        ],
        backgroundColor: subjectColor,
        borderColor: [
            theme.palette.success.main, // Border for Easy bars
            theme.palette.warning.main, // Border for Medium bars
            theme.palette.error.main    // Border for Hard bars
        ],
        borderWidth: 2,
      };
    })
    .filter(Boolean); // Remove any nulls if a subject wasn't found

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
            color: theme.palette.text.primary,
            usePointStyle: true,
            boxWidth: 8
        },
      },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: theme.palette.text.secondary },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: theme.palette.text.secondary, callback: (value) => `${value}%` },
        grid: { color: theme.palette.divider },
        title: { display: true, text: 'Average Score', color: theme.palette.text.secondary },
      },
    },
  };

  return (
    <Paper ref={ref} elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
        Performance by Difficulty
      </Typography>
      <Box sx={{ height: { xs: '300px', md: '350px' } }}>
        <Bar options={options} data={data} />
      </Box>
    </Paper>
  );
});

export default DifficultyBreakdownChart;