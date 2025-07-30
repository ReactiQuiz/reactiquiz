// src/components/dashboard/DifficultyPerformanceCard.js
import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, LinearProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

const DifficultyBar = ({ label, value, color }) => {
    const theme = useTheme();
    return (
        <ListItem disablePadding>
            <ListItemText
                primary={label}
                sx={{ flexBasis: '20%', minWidth: '80px' }}
            />
            <Box sx={{ width: '100%', flexBasis: '80%', ml: 2 }}>
                <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {value.toFixed(0)}%
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={value}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(color, 0.2),
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: color,
                        }
                    }}
                />
            </Box>
        </ListItem>
    );
};

function DifficultyPerformanceCard({ data, title }) {
    const theme = useTheme();
    
    if (!data) return null;
    
    const { easy, medium, hard } = data;

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                {title}
            </Typography>
            <List>
                <DifficultyBar label="Easy" value={easy.average} color={theme.palette.success.main} />
                <DifficultyBar label="Medium" value={medium.average} color={theme.palette.warning.main} />
                <DifficultyBar label="Hard" value={hard.average} color={theme.palette.error.main} />
            </List>
        </Paper>
    );
}

export default DifficultyPerformanceCard;