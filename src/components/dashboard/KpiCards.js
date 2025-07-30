// src/components/dashboard/KpiCards.js
import React, { useState } from 'react';
import { Paper, Typography, Box, Collapse, List, ListItem, ListItemText, Divider, IconButton, useTheme } from '@mui/material';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const KpiCard = ({ title, value, caption, breakdownData, onToggle, expanded }) => {
    const theme = useTheme();
    const { getColor } = useSubjectColors();

    return (
        <Paper
            elevation={3}
            sx={{
                p: { xs: 2, sm: 2.5 },
                textAlign: 'center',
                border: `1px solid ${theme.palette.divider}`,
                cursor: 'pointer',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                    boxShadow: theme.shadows[6],
                }
            }}
            onClick={onToggle}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    {title}
                </Typography>
                <IconButton size="small" sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                    <ExpandMoreIcon />
                </IconButton>
            </Box>
            <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {caption}
            </Typography>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <List dense sx={{ pt: 2, textAlign: 'left' }}>
                    <Divider />
                    {Object.entries(breakdownData).map(([subjectKey, data]) => (
                        <ListItem key={subjectKey}>
                            <ListItemText
                                primary={data.name}
                                primaryTypographyProps={{ sx: { color: getColor(subjectKey), fontWeight: 500 } }}
                                secondary={`${data.value}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Collapse>
        </Paper>
    );
};

function KpiCards({ totalQuizzes, averageScore, subjectBreakdowns, isFiltered }) {
    const [quizzesExpanded, setQuizzesExpanded] = useState(false);
    const [scoresExpanded, setScoresExpanded] = useState(false);

    const quizzesBreakdown = Object.entries(subjectBreakdowns).reduce((acc, [key, value]) => {
        acc[key] = { name: value.name, value: `${value.count} quiz(zes)` };
        return acc;
    }, {});
    
    const scoresBreakdown = Object.entries(subjectBreakdowns).reduce((acc, [key, value]) => {
        acc[key] = { name: value.name, value: `${value.average}% average` };
        return acc;
    }, {});

    return (
        <>
            <KpiCard
                title="Total Quizzes Solved"
                value={totalQuizzes}
                caption={isFiltered ? '(in selected filter)' : '(in selected period)'}
                breakdownData={quizzesBreakdown}
                expanded={quizzesExpanded}
                onToggle={() => setQuizzesExpanded(!quizzesExpanded)}
            />
            <KpiCard
                title="Overall Average Score"
                value={`${averageScore}%`}
                caption={isFiltered ? '(in selected filter)' : '(in selected period)'}
                breakdownData={scoresBreakdown}
                expanded={scoresExpanded}
                onToggle={() => setScoresExpanded(!scoresExpanded)}
            />
        </>
    );
}

export default KpiCards;