// src/components/dashboard/AverageScoreTrendChart.js
import React, { forwardRef } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { parseISO, format, isValid } from 'date-fns';
import { alpha } from '@mui/material/styles';

const AverageScoreTrendChart = forwardRef(({ trendData, title }, ref) => {
  const theme = useTheme();

  const chartData = {
    labels: trendData.labels,
    datasets: [
      {
        label: '30-Day Rolling Average',
        data: trendData.data,
        fill: true,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        tension: 0.3,
        pointBackgroundColor: theme.palette.primary.main,
        spanGaps: true, // Connects line over null data points for a continuous trend
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top', labels: { color: theme.palette.text.primary } },
      title: { display: false },
      tooltip: {
        callbacks: {
          title: (context) => format(parseISO(context[0].label), 'PPP'),
          label: (context) => `Avg. Score: ${context.raw.toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'day', tooltipFormat: 'PPP', displayFormats: { day: 'MMM d' } },
        ticks: { color: theme.palette.text.secondary },
        grid: { color: alpha(theme.palette.text.secondary, 0.1) },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        ticks: { color: theme.palette.text.secondary, callback: (value) => `${value}%` },
        grid: { color: alpha(theme.palette.text.secondary, 0.1) },
        title: { display: true, text: 'Average Score (%)', color: theme.palette.text.secondary },
      },
    },
    interaction: { intersect: false, mode: 'index' },
  };

  return (
    <Paper ref={ref} elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
        {title}
      </Typography>
      <Box sx={{ height: { xs: '300px', md: '350px' } }}>
        {trendData && trendData.labels.length > 0 ? (
          <Line options={chartOptions} data={chartData} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography color="text.secondary">Not enough data to display trend.</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
});

export default AverageScoreTrendChart;