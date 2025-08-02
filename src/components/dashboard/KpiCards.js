// src/components/dashboard/KpiCards.js
import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Divider, useTheme, Stack, Grid, LinearProgress, Chip, alpha } from '@mui/material';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';
import KpiBreakdownPieChart from './KpiBreakdownPieChart';

// This is the individual card component for the "Overall Average Score"
const AverageScoreCard = ({ value, caption, breakdownData, overallQuestionStats }) => {
    const theme = useTheme();
    const { getColor } = useSubjectColors();

    // Helper function to style the percentage chip based on value
    const getVibrantChipStyles = (percentage) => {
        if (percentage >= 70) return { backgroundColor: theme.palette.success.main };
        if (percentage >= 40) return { backgroundColor: theme.palette.warning.main };
        return { backgroundColor: theme.palette.error.main };
    };

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            {/* Top section with the main average score */}
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    Overall Average Score
                </Typography>
                <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">{caption}</Typography>
            </Box>

            {/* Overall Progress Bar */}
            <Box sx={{ my: 2 }}>
                <LinearProgress
                    variant="determinate"
                    value={parseFloat(value)}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.primary.main }
                    }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                        {overallQuestionStats.correct} Correct
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {overallQuestionStats.total} Questions
                    </Typography>
                </Box>
            </Box>

            {/* List of per-subject averages with chips */}
            <List dense sx={{ pt: 1, textAlign: 'left' }}>
                <Divider sx={{ mb: 1 }} />
                {Object.entries(breakdownData).length > 0 ? Object.entries(breakdownData).map(([subjectKey, data]) => (
                    <ListItem key={subjectKey} dense disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
                        <ListItemText
                            primary={data.name}
                            primaryTypographyProps={{ sx: { color: getColor(subjectKey), fontWeight: 500 } }}
                            secondary={`(${data.totalQuestions} Qs)`}
                        />
                        <Chip
                            label={`${data.average}%`}
                            size="small"
                            sx={{
                                fontWeight: 'bold',
                                color: '#fff',
                                ...getVibrantChipStyles(data.average)
                            }}
                        />
                    </ListItem>
                )) : <Typography variant="caption" color="text.secondary">No subject data.</Typography>}
            </List>
        </Paper>
    );
};

// This is the main component that orchestrates the layout for the left column.
function KpiCards({ totalQuizzes, averageScore, subjectBreakdowns, isFiltered, overallQuestionStats }) {
    const { getColor } = useSubjectColors();

    const quizzesBreakdownForChart = Object.entries(subjectBreakdowns).reduce((acc, [key, value]) => {
        acc[key] = { name: value.name, count: value.count };
        return acc;
    }, {});
    
    // Pass the raw average number for chip styling
    const scoresBreakdownForList = Object.entries(subjectBreakdowns).reduce((acc, [key, value]) => {
        acc[key] = { 
            name: value.name, 
            average: value.average,
            totalQuestions: value.totalQuestions 
        };
        return acc;
    }, {});

    return (
        <Stack spacing={2}>
            {/* Top Card: Total Quizzes Solved */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid theme.palette.divider` }}>
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, textAlign: 'center', mb: 2 }}>
                    Total Quizzes Solved
                </Typography>
                <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <List dense sx={{ textAlign: 'left', p: 0 }}>
                            {Object.entries(quizzesBreakdownForChart).map(([key, data]) => (
                                <ListItem key={key} dense disableGutters>
                                    <ListItemText
                                        primary={data.name}
                                        primaryTypographyProps={{ sx: { color: getColor(key), fontWeight: 'bold' } }}
                                        secondary={`${data.count} quiz(zes)`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                            {totalQuizzes}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {isFiltered ? '(in selected filter)' : '(in selected period)'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <KpiBreakdownPieChart breakdownData={quizzesBreakdownForChart} />
                    </Grid>
                </Grid>
            </Paper>
            
            {/* Bottom Card: Overall Average Score */}
            <AverageScoreCard
                value={`${averageScore}%`}
                caption={isFiltered ? '(in selected filter)' : '(in selected period)'}
                breakdownData={scoresBreakdownForList}
                overallQuestionStats={overallQuestionStats}
            />
        </Stack>
    );
}

export default KpiCards;