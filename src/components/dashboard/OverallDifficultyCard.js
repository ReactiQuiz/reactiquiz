// src/components/dashboard/OverallDifficultyCard.js
import React from 'react';
import { Paper, Typography, Box, Grid, useTheme } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const StatItem = ({ title, value, color }) => (
    <Grid item xs={4} sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
            {value}
        </Typography>
        <Typography variant="body2" sx={{ color }}>
            {title}
        </Typography>
    </Grid>
);

function OverallDifficultyCard({ data }) {
    const theme = useTheme();

    if (!data) return null;

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                <CheckCircleOutlineIcon sx={{ mr: 1, color: 'text.secondary' }} />
                Correct Answers by Difficulty
            </Typography>
            <Grid container spacing={1}>
                <StatItem title="Easy" value={data.easy.correct} color={theme.palette.success.main} />
                <StatItem title="Medium" value={data.medium.correct} color={theme.palette.warning.main} />
                <StatItem title="Hard" value={data.hard.correct} color={theme.palette.error.main} />
            </Grid>
        </Paper>
    );
}

export default OverallDifficultyCard;