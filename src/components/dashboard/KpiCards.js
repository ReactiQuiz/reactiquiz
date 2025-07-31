// src/components/dashboard/KpiCards.js
import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Divider, useTheme, Stack, Grid } from '@mui/material';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';
import KpiBreakdownPieChart from './KpiBreakdownPieChart';

// This component is for the "Overall Average Score" card, which has a simpler layout
const AverageScoreCard = ({ value, caption, breakdownData }) => {
    const theme = useTheme();
    const { getColor } = useSubjectColors();

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    Overall Average Score
                </Typography>
                <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">{caption}</Typography>
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
                )) : <Typography variant="caption" color="text.secondary">No subject data.</Typography>}
            </List>
        </Paper>
    );
};

// This is the main component that orchestrates the layout
function KpiCards({ totalQuizzes, averageScore, subjectBreakdowns, isFiltered }) {
    const { getColor } = useSubjectColors();

    const quizzesBreakdown = Object.entries(subjectBreakdowns).reduce((acc, [key, value]) => {
        acc[key] = { name: value.name, count: value.count };
        return acc;
    }, {});
    
    const scoresBreakdown = Object.entries(subjectBreakdowns).reduce((acc, [key, value]) => {
        acc[key] = { name: value.name, value: `${value.average}% average` };
        return acc;
    }, {});

    return (
        <Stack spacing={2}>
            {/* --- START OF FINAL FIX: New 3-Column Layout for Total Quizzes --- */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid theme.palette.divider` }}>
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, textAlign: 'center', mb: 2 }}>
                    Total Quizzes Solved
                </Typography>
                <Grid container spacing={1} alignItems="center">
                    {/* Column 1: Textual Breakdown */}
                    <Grid item xs={12} sm={4}>
                        <List dense sx={{ textAlign: 'left' }}>
                            {Object.entries(quizzesBreakdown).map(([key, data]) => (
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
                    {/* Column 2: The Big Number */}
                    <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                            {totalQuizzes}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {isFiltered ? '(in selected filter)' : '(in selected period)'}
                        </Typography>
                    </Grid>
                    {/* Column 3: The Pie Chart */}
                    <Grid item xs={12} sm={4}>
                        <KpiBreakdownPieChart breakdownData={quizzesBreakdown} />
                    </Grid>
                </Grid>
            </Paper>
            {/* --- END OF FINAL FIX --- */}
            
            <AverageScoreCard
                value={`${averageScore}%`}
                caption={isFiltered ? '(in selected filter)' : '(in selected period)'}
                breakdownData={scoresBreakdown}
            />
        </Stack>
    );
}

export default KpiCards;