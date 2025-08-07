// src/components/dashboard/OverallDifficultyCard.js
import React from 'react';
import { Paper, Typography, Box, Grid, LinearProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

const StatItem = ({ title, value, total, color }) => (
    <Grid item xs={4} sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
            {value}
        </Typography>
        <Typography variant="body2" sx={{ color }}>
            {title}
        </Typography>
        <LinearProgress
            variant="determinate"
            value={total > 0 ? (value / total) * 100 : 0}
            sx={{
                height: 6, borderRadius: 3, mt: 1,
                backgroundColor: alpha(color, 0.2),
                '& .MuiLinearProgress-bar': { backgroundColor: color }
            }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {total} Qs
        </Typography>
    </Grid>
);

function OverallDifficultyCard({ data }) {
    const theme = useTheme();
    if (!data) return null;

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Correct Answers by Difficulty
            </Typography>
            {/* --- START OF FIX: Ensure grid items are aligned --- */}
            <Grid container spacing={1} alignItems="stretch">
                <StatItem title="Easy" value={data.easy.correct} total={data.easy.total} color={theme.palette.success.main} />
                <StatItem title="Medium" value={data.medium.correct} total={data.medium.total} color={theme.palette.warning.main} />
                <StatItem title="Hard" value={data.hard.correct} total={data.hard.total} color={theme.palette.error.main} />
            </Grid>
            {/* --- END OF FIX --- */}
        </Paper>
    );
}

export default OverallDifficultyCard;// src/components/dashboard/OverallDifficultyCard.js
import React from 'react';
import { Paper, Typography, Box, Grid, LinearProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

const StatItem = ({ title, value, total, color }) => (
    <Grid item xs={4} sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
            {value}
        </Typography>
        <Typography variant="body2" sx={{ color }}>
            {title}
        </Typography>
        <LinearProgress
            variant="determinate"
            value={total > 0 ? (value / total) * 100 : 0}
            sx={{
                height: 6, borderRadius: 3, mt: 1,
                backgroundColor: alpha(color, 0.2),
                '& .MuiLinearProgress-bar': { backgroundColor: color }
            }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {total} Qs
        </Typography>
    </Grid>
);

function OverallDifficultyCard({ data }) {
    const theme = useTheme();
    if (!data) return null;

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Correct Answers by Difficulty
            </Typography>
            <Grid container spacing={1} alignItems="stretch">
                <StatItem title="Easy" value={data.easy.correct} total={data.easy.total} color={theme.palette.success.main} />
                <StatItem title="Medium" value={data.medium.correct} total={data.medium.total} color={theme.palette.warning.main} />
                <StatItem title="Hard" value={data.hard.correct} total={data.hard.total} color={theme.palette.error.main} />
            </Grid>
        </Paper>
    );
}

export default OverallDifficultyCard;