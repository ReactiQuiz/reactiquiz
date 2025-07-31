// src/components/dashboard/OverallDifficultyCard.js
import React from 'react';
import { Paper, Typography, Box, Grid, List, ListItem, ListItemText, LinearProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

const StatItem = ({ title, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <Grid item xs={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
                    {value}
                </Typography>
                <Typography variant="body2" sx={{ color, mb: 1 }}>
                    {title}
                </Typography>
                <Box sx={{ width: '80%' }}>
                    <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(color, 0.2),
                            '& .MuiLinearProgress-bar': { backgroundColor: color }
                        }}
                    />
                </Box>
            </Box>
        </Grid>
    );
};

function OverallDifficultyCard({ data }) {
    const theme = useTheme();

    if (!data) return null;

    return (
        <Paper elevation={3} sx={{ ml: { xs: 2, sm: 2.5 }, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Correct Answers by Difficulty
            </Typography>
            <Grid container spacing={1} alignItems="center">
                <StatItem title="Easy" value={data.easy.correct} total={data.easy.total} color={theme.palette.success.main} />
                <StatItem title="Medium" value={data.medium.correct} total={data.medium.total} color={theme.palette.warning.main} />
                <StatItem title="Hard" value={data.hard.correct} total={data.hard.total} color={theme.palette.error.main} />
            </Grid>
        </Paper>
    );
}

export default OverallDifficultyCard;