// src/components/dashboard/KpiCards.js
import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Divider, useTheme, Stack, Grid } from '@mui/material';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';
import KpiBreakdownPieChart from './KpiBreakdownPieChart';

// This is the individual card component for the "Overall Average Score"
const AverageScoreCard = ({ value, caption, breakdownData }) => {
    const theme = useTheme();
    const { getColor } = useSubjectColors();

    return (
        <Paper
            elevation={3}
            sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}` }}
        >
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    Overall Average Score
                </Typography>
                <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {caption}
                </Typography>
            </Box>
            <List dense sx={{ pt: 2, textAlign: 'left' }}>
                <Divider sx={{ mb: 1 }} />
                {Object.entries(breakdownData).length > 0 ? Object.entries(breakdownData).map(([subjectKey, data]) => (
                    <ListItem key={subjectKey} dense disableGutters>
                        <ListItemText
                            primary={data.name}
                            primaryTypographyProps={{ sx: { color: getColor(subjectKey), fontWeight: 500 } }}
                            secondary={`${data.value}`}
                        />
                    </ListItem>
                )) : <Typography variant="caption" color="text.secondary">No subject data for this period.</Typography>}
            </List>
        </Paper>
    );
};

// This is the main component that orchestrates the layout
function KpiCards({ totalQuizzes, averageScore, subjectBreakdowns, isFiltered }) {
    const theme = useTheme();

    const quizzesBreakdownForChart = Object.entries(subjectBreakdowns).reduce((acc, [key, value]) => {
        acc[key] = { name: value.name, count: value.count };
        return acc;
    }, {});
    
    const scoresBreakdownForList = Object.entries(subjectBreakdowns).reduce((acc, [key, value]) => {
        acc[key] = { name: value.name, value: `${value.average}% average` };
        return acc;
    }, {});

    return (
        <Stack spacing={2}>
            {/* --- START OF FIX: New Top Card with Internal Grid Layout --- */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}` }}>
                <Grid container spacing={2} alignItems="center">
                    {/* Left side of the top card */}
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1rem' }}>
                                Total Quizzes Solved
                            </Typography>
                            <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                                {totalQuizzes}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isFiltered ? '(in selected filter)' : '(in selected period)'}
                            </Typography>
                        </Box>
                    </Grid>
                    {/* Right side of the top card */}
                    <Grid item xs={12} sm={6}>
                        <KpiBreakdownPieChart breakdownData={quizzesBreakdownForChart} />
                    </Grid>
                </Grid>
            </Paper>
            {/* --- END OF FIX --- */}
            
            {/* Bottom Card for Average Score */}
            <AverageScoreCard
                value={`${averageScore}%`}
                caption={isFiltered ? '(in selected filter)' : '(in selected period)'}
                breakdownData={scoresBreakdownForList}
            />
        </Stack>
    );
}

export default KpiCards;