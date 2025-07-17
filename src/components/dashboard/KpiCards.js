// src/components/dashboard/KpiCards.js
import React from 'react';
import { Paper, Typography, useTheme, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// This component now represents a SINGLE KPI card.
function KpiCard({ title, subject, icon, color }) {
    return (
        <Paper sx={{ p: 2, textAlign: 'center', height: '100%', borderTop: `4px solid ${color}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {icon}
                <Typography variant="h6" color="text.secondary" sx={{fontSize: {xs: '1rem', sm: '1.125rem'}}}>{title}</Typography>
            </Box>
            <Typography variant="h5" sx={{ color: color, fontWeight: 'bold', fontSize: {xs: '1.5rem', sm: '2rem'} }}>
                {subject ? subject.name : 'N/A'}
            </Typography>
            <Typography variant="body1" color="text.primary">
                {subject ? `${subject.average}% avg` : '-'}
                <Typography variant="caption" color="text.secondary">
                    {subject ? ` over ${subject.count} quiz(zes)` : ''}
                </Typography>
            </Typography>
        </Paper>
    );
}

// --- START OF FIX ---
// This component is now just a wrapper that decides which single card to show.
// We rename it to be more descriptive.
function KpiDisplay({ bestSubject, weakestSubject }) {
    const theme = useTheme();

    if (bestSubject) {
        return (
            <KpiCard
                title="Best Subject"
                subject={bestSubject}
                icon={<TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: '2rem' }} />}
                color={theme.palette.success.main}
            />
        );
    }

    if (weakestSubject) {
        return (
            <KpiCard
                title="Needs Focus"
                subject={weakestSubject}
                icon={<TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: '2rem' }} />}
                color={theme.palette.error.main}
            />
        );
    }
    
    // Return null if no props are provided, though this shouldn't happen with the new parent logic.
    return null;
}
// --- END OF FIX ---

export default KpiDisplay; // <-- Export the new wrapper component