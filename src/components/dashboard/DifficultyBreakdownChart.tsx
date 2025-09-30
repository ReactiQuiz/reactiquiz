// src/components/dashboard/DifficultyBreakdownChart.tsx
import React, { forwardRef } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';
import { Subject } from '../../types';

interface DifficultyBreakdownChartProps {
  performanceData: Record<string, {
    easy: { correct: number; total: number; percentage: number };
    medium: { correct: number; total: number; percentage: number };
    hard: { correct: number; total: number; percentage: number };
  }>;
  subjects: Subject[];
}

const DifficultyBreakdownChart = forwardRef<HTMLDivElement, DifficultyBreakdownChartProps>(({ performanceData, subjects }, ref) => {
  const theme = useTheme();
  const { getColor } = useSubjectColors();

  const labels = ['Easy', 'Medium', 'Hard'];

  const datasets = Object.keys(performanceData)
    .map(subjectKey => {
      const subjectInfo = subjects.find(s => s.subjectKey === subjectKey);
      if (!subjectInfo) return null;

      const subjectData = performanceData[subjectKey];
      if (!subjectData) return null;
      
      const subjectColor = getColor(subjectKey);

      return {
        label: subjectInfo.name,
        data: [
          subjectData.easy.percentage,
          subjectData.medium.percentage,
          subjectData.hard.percentage,
        ],
        backgroundColor: subjectColor,
        borderColor: [
          theme.palette.success.main, // Border for Easy bars
          theme.palette.warning.main, // Border for Medium bars
          theme.palette.error.main, // Border for Hard bars
        ],
        borderWidth: 2,
      };
    })
    .filter((dataset): dataset is NonNullable<typeof dataset> => dataset !== null);

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary,
        },
      },
      title: {
        display: true,
        text: 'Difficulty Performance by Subject',
        color: theme.palette.text.primary,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme.palette.text.secondary,
        },
        grid: {
          color: theme.palette.divider,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: theme.palette.text.secondary,
          callback: function(value: any) {
            return value + '%';
          },
        },
        grid: {
          color: theme.palette.divider,
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        Difficulty Performance Breakdown
      </Typography>
      <Box ref={ref} sx={{ height: '400px', position: 'relative' }}>
        <Bar data={chartData} options={options} />
      </Box>
    </Paper>
  );
});

DifficultyBreakdownChart.displayName = 'DifficultyBreakdownChart';

export default DifficultyBreakdownChart;
