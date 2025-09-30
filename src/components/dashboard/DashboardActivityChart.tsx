// src/components/dashboard/DashboardActivityChart.tsx
import React, { forwardRef } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { parseISO, format, isValid } from 'date-fns';
import { alpha } from '@mui/material/styles';

interface DashboardActivityChartProps {
  activityData: Array<{ date: string; quizzes: number; score: number }>;
  timeFrequency: 'week' | 'month' | 'year';
}

const DashboardActivityChart = forwardRef<HTMLDivElement, DashboardActivityChartProps>(({ activityData, timeFrequency }, ref) => {
  const theme = useTheme();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top' as const, 
        labels: { 
            color: theme.palette.text.primary,
            usePointStyle: true, // Use circles instead of boxes for a cleaner look
            boxWidth: 8,
        } 
      },
      title: { display: false },
      tooltip: {
        callbacks: {
            title: function(context: any) {
                const date = parseISO(context[0].label);
                return isValid(date) ? format(date, 'PPP') : context[0].label;
            }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: theme.palette.text.secondary,
          maxTicksLimit: timeFrequency === 'week' ? 7 : timeFrequency === 'month' ? 10 : 12,
        },
        grid: {
          color: theme.palette.divider,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: theme.palette.text.secondary,
        },
        grid: {
          color: theme.palette.divider,
        },
      },
    },
  };

  const chartData = {
    labels: activityData.map(item => item.date),
    datasets: [
      {
        label: 'Quizzes Taken',
        data: activityData.map(item => item.quizzes),
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        fill: true,
        tension: 0.3,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: theme.palette.primary.main,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Average Score (%)',
        data: activityData.map(item => item.score),
        borderColor: theme.palette.secondary.main,
        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
        fill: false,
        tension: 0.3,
        pointBackgroundColor: theme.palette.secondary.main,
        pointBorderColor: theme.palette.secondary.main,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      },
    ],
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        Activity Overview
      </Typography>
      <Box ref={ref} sx={{ height: '400px', position: 'relative' }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
});

DashboardActivityChart.displayName = 'DashboardActivityChart';

export default DashboardActivityChart;
