// src/components/dashboard/KpiCards.js
import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Divider, useTheme, Grid } from '@mui/material';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';

const KpiCard = ({ title, value, caption, breakdownData }) => {
    const theme = useTheme();
    const { getColor } = useSubjectColors();

    return (
        <Paper
            elevation={3}
            sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}` }}
        >
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    {title}
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

function KpiCards({ totalQuizzes, averageScore, subjectBreakdowns, isFiltered }) {
    const quizzesBreakdown = Object.entries(subjectBreakdowns).reduce((acc, [key, value]) => {
        acc[key] = { name: value.name, value: `${value.count} quiz(zes)` };
        return acc;
    }, {});
    
    const scoresBreakdown = Object.entries(subjectBreakdowns).reduce((acc, [key, value]) => {
        acc[key] = { name: value.name, value: `${value.average}% average` };
        return acc;
    }, {});

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <KpiCard
                    title="Total Quizzes Solved"
                    value={totalQuizzes}
                    caption={isFiltered ? '(in selected filter)' : '(in selected period)'}
                    breakdownData={quizzesBreakdown}
                />
            </Grid>
            <Grid item xs={12}>
                <KpiCard
                    title="Overall Average Score"
                    value={`${averageScore}%`}
                    caption={isFiltered ? '(in selected filter)' : '(in selected period)'}
                    breakdownData={scoresBreakdown}
                />
            </Grid>
        </Grid>
    );
}

export default KpiCards;