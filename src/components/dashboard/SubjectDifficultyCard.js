// src/components/dashboard/SubjectDifficultyCard.js
import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, LinearProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';

const DifficultyBar = ({ label, value, color, count }) => {
    return (
        <ListItem disablePadding sx={{ alignItems: 'flex-start' }}>
            <ListItemText
                primary={label}
                secondary={`${count} Qs`}
                sx={{ flexBasis: '25%', minWidth: '80px', mr: 2 }}
            />
            <Box sx={{ width: '100%', flexBasis: '75%' }}>
                <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {value.toFixed(0)}%
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={value}
                    sx={{
                        height: 8, borderRadius: 4,
                        backgroundColor: alpha(color, 0.2),
                        '& .MuiLinearProgress-bar': { backgroundColor: color }
                    }}
                />
            </Box>
        </ListItem>
    );
};

function SubjectDifficultyCard({ subjectKey, title, data }) {
    const theme = useTheme();
    const { getColor } = useSubjectColors();
    const accentColor = getColor(subjectKey);

    if (!data) return null;
    
    const { easy, medium, hard } = data;

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', borderTop: `4px solid ${accentColor}` }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'medium', color: accentColor }}>
                {title}
            </Typography>
            <List dense>
                <DifficultyBar label="Easy" value={easy.average} count={easy.count} color={theme.palette.success.main} />
                <DifficultyBar label="Medium" value={medium.average} count={medium.count} color={theme.palette.warning.main} />
                <DifficultyBar label="Hard" value={hard.average} count={hard.count} color={theme.palette.error.main} />
            </List>
        </Paper>
    );
}

export default SubjectDifficultyCard;