// src/components/dashboard/AverageScoreTrendChart.tsx
import React, { forwardRef } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { parseISO, format } from 'date-fns';
import { alpha } from '@mui/material/styles';

interface AverageScoreTrendChartProps {
  trendData: Array<{ date: string; averageScore: number }>;
  title: string;
}

const AverageScoreTrendChart = forwardRef<HTMLDivElement, AverageScoreTrendChartProps>(({ trendData, title }, ref) => {
  const theme = useTheme();

  const chartData = {
    labels: trendData.map(item => format(parseISO(item.date), 'MMM dd')),
    datasets: [
      {
        label: '30-Day Rolling Average',
        data: trendData.map(item => item.averageScore),
        fill: true,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        tension: 0.3, // This adds the curve to the line, making it smooth.
        pointBackgroundColor: theme.palette.primary.main,
        spanGaps: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme.palette.text.primary,
        },
      },
      title: {
        display: true,
        text: title,
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
        {title}
      </Typography>
      <Box ref={ref} sx={{ height: '400px', position: 'relative' }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
});

AverageScoreTrendChart.displayName = 'AverageScoreTrendChart';

export default AverageScoreTrendChart;
