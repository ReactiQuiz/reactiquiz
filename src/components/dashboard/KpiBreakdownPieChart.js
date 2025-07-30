// src/components/dashboard/KpiBreakdownPieChart.js
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';

ChartJS.register(ArcElement, Tooltip, Legend);

function KpiBreakdownPieChart({ breakdownData }) {
    const theme = useTheme();
    const { getColor } = useSubjectColors();

    const data = {
        labels: Object.values(breakdownData).map(item => item.name),
        datasets: [
            {
                data: Object.values(breakdownData).map(item => item.count),
                backgroundColor: Object.keys(breakdownData).map(key => getColor(key)),
                borderColor: theme.palette.background.paper,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                display: false, // We will render a custom list in the KpiCards component
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += `${context.parsed} quiz(zes)`;
                        }
                        return label;
                    },
                },
            },
        },
    };

    if (Object.keys(breakdownData).length === 0) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="caption" color="text.secondary">No data to display</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: '140px' }}>
            <Doughnut data={data} options={options} />
        </Box>
    );
}

export default KpiBreakdownPieChart;