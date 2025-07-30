// src/components/dashboard/KpiCards.js
import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Divider, useTheme, Grid, LinearProgress } from '@mui/material';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';
import KpiBreakdownPieChart from './KpiBreakdownPieChart'; // Import the new pie chart

function KpiCards({ totalQuizzes, averageScore, subjectBreakdowns, isFiltered }) {
    const theme = useTheme();
    const { getColor } = useSubjectColors();

    const quizzesBreakdown = Object.entries(subjectBreakdowns).reduce((acc, [key, value]) => {
        acc[key] = { name: value.name, count: value.count };
        return acc;
    }, {});
    
    return (
        <Paper
            elevation={3}
            sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}`, height: '100%' }}
        >
            <Grid container spacing={2} sx={{ height: '100%' }}>
                {/* Left Side - Main Stats */}
                <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* Total Quizzes Section */}
                    <Box sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1rem' }}>Total Quizzes Solved</Typography>
                        <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 'bold' }}>{totalQuizzes}</Typography>
                        <Typography variant="caption" color="text.secondary">{isFiltered ? '(in selected filter)' : '(in selected period)'}</Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Overall Average Section */}
                    <Box sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1rem' }}>Overall Average Score</Typography>
                        <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 'bold' }}>{averageScore}%</Typography>
                        <Typography variant="caption" color="text.secondary">{isFiltered ? '(in selected filter)' : '(in selected period)'}</Typography>
                    </Box>
                </Grid>

                {/* Right Side - Breakdowns */}
                <Grid item xs={12} sm={6}>
                    <KpiBreakdownPieChart breakdownData={quizzesBreakdown} />
                    <List dense sx={{ pt: 1, textAlign: 'left' }}>
                        {Object.entries(subjectBreakdowns).map(([key, data]) => (
                            <ListItem key={key} dense disableGutters>
                                <Box sx={{ width: '100%' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ color: getColor(key), fontWeight: 500 }}>
                                            {data.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                            {data.average}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={data.average}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            '& .MuiLinearProgress-bar': { backgroundColor: getColor(key) }
                                        }}
                                    />
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                </Grid>
            </Grid>
        </Paper>
    );
}

export default KpiCards;