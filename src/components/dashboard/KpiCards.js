// src/components/dashboard/KpiCards.js
import React from 'react';
import { Paper, Typography, Box, Collapse, List, ListItem, ListItemText, Divider, IconButton, useTheme } from '@mui/material';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Paper, Typography, Box, Collapse, List, ListItem, ListItemText, Divider, IconButton, useTheme, Grid } from '@mui/material';

const KpiCard = ({ title, value, caption, breakdownData, onToggle, expanded }) => {
    const theme = useTheme();
    const { getColor } = useSubjectColors();

    return (
        <Paper
            elevation={3}
            sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${theme.palette.divider}`, cursor: 'pointer', '&:hover': { boxShadow: theme.shadows[4] } }}
            onClick={onToggle}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>{title}</Typography>
                <IconButton size="small" sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                    <ExpandMoreIcon />
                </IconButton>
            </Box>
            <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">{caption}</Typography>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <List dense sx={{ pt: 2, textAlign: 'left' }}>
                    <Divider sx={{ mb: 1 }} />
                    {Object.entries(breakdownData).length > 0 ? Object.entries(breakdownData).map(([subjectKey, data]) => (
                        <ListItem key={subjectKey} dense>
                            <ListItemText
                                primary={data.name}
                                primaryTypographyProps={{ sx: { color: getColor(subjectKey), fontWeight: 500 } }}
                                secondary={`${data.value}`}
                            />
                        </ListItem>
                    )) : <Typography variant="caption" color="text.secondary">No subject data for this period.</Typography>}
                </List>
            </Collapse>
        </Paper>
    );
};

// This component orchestrates both KPI cards so their state is linked.
function KpiCards({ totalQuizzes, averageScore, subjectBreakdowns, isFiltered, expanded, onToggle }) {
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
                    expanded={expanded}
                    onToggle={onToggle}
                />
            </Grid>
            <Grid item xs={12}>
                <KpiCard
                    title="Overall Average Score"
                    value={`${averageScore}%`}
                    caption={isFiltered ? '(in selected filter)' : '(in selected period)'}
                    breakdownData={scoresBreakdown}
                    expanded={expanded}
                    onToggle={onToggle}
                />
            </Grid>
        </Grid>
    );
}

export default KpiCards;