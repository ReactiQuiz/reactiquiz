// src/components/DashboardActivityChart.js
import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { parseISO, format, isValid } from 'date-fns';
import { alpha } from '@mui/material/styles';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

function DashboardActivityChart({ activityData, timeFrequency }) {
  const theme = useTheme();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top', labels: { color: theme.palette.text.primary } },
      title: { display: false, text: 'Quiz Activity Trend', color: theme.palette.text.primary, font: { size: 16 } },
      tooltip: {
        callbacks: {
            title: function(context) {
                const date = parseISO(context[0].label);
                return isValid(date) ? format(date, 'PPP') : context[0].label;
            }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeFrequency === 7 ? 'day' : (timeFrequency === 30 ? 'day' : (timeFrequency === 90 ? 'week' : 'month')),
          tooltipFormat: 'PPP',
           displayFormats: {
             day: 'MMM d',
             week: 'MMM d, yy',
             month: 'MMM yyyy'
           }
        },
        ticks: { color: theme.palette.text.secondary, maxRotation: 0, autoSkipPadding: 10 },
        grid: { color: alpha(theme.palette.text.secondary, 0.1) }
      },
      y: {
        beginAtZero: true,
        ticks: { color: theme.palette.text.secondary, stepSize: 1 },
        grid: { color: alpha(theme.palette.text.secondary, 0.1) },
        title: { display: true, text: 'Number of Quizzes', color: theme.palette.text.secondary}
      }
    },
    interaction: {
        intersect: false,
        mode: 'index',
    },
  };

  return (
    <Paper elevation={3} sx={{ p: {xs: 1, sm: 2}, mt: 3, backgroundColor: theme.palette.background.paper }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{color: theme.palette.text.primary, ml: {xs:1, sm:0}}}>Activity Overview</Typography>
      </Box>
      <Box sx={{ height: { xs: '300px', sm: '350px', md: '400px' }, width: '100%' }}>
        {activityData && activityData.labels && activityData.labels.length > 0 ? (
          <Line options={chartOptions} data={activityData} />
        ) : (
          <Typography sx={{textAlign: 'center', color: theme.palette.text.secondary, pt: 5}}>No quiz activity for the selected period.</Typography>
        )}
      </Box>
    </Paper>
  );
}

export default DashboardActivityChart;