// src/components/dashboard/DashboardControls.js
import React from 'react';
import { Paper, Box, Typography, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';

const timeFrequencyOptions = [
    { value: 7, label: 'Last 7 Days' },
    { value: 30, label: 'Last 30 Days' },
    { value: 90, label: 'Last 90 Days' },
    { value: 365, label: 'Last Year' },
    { value: 'all', label: 'All Time' },
];

function DashboardControls({ timeFrequency, onTimeFrequencyChange, allSubjects, selectedSubject, onSubjectChange }) {
    // --- START OF FIX ---
    // Ensure the value for the Select component is always valid.
    const validTimeFrequency = timeFrequencyOptions.some(opt => opt.value === timeFrequency) ? timeFrequency : 30;
    // --- END OF FIX ---

    return (
        <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
            <Grid
                container
                spacing={{
                    xs: '1%',
                    sm: '1%',
                    md: '1%',
                    lg: '1%',
                    xl: '1%'
                }}>
                <Grid
                    item
                    width={{
                        xs: '100%',
                        sm: '100%',
                        md: '49%',
                        lg: '49%',
                        xl: '49%'
                    }}>
                    <Typography variant="h6" color="text.primary" sx={{ mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        Dashboard Filters
                    </Typography>
                </Grid>
                {/* Use a Grid container to manage the layout of the dropdowns */}
                <Grid
                    item
                    width={{
                        xs: '49.5%',
                        sm: '49.5%',
                        md: '24.5%',
                        lg: '24.5%',
                        xl: '24.5%'
                    }}>
                    <FormControl size="small" fullWidth>
                        <InputLabel id="time-freq-main-label">Time Period</InputLabel>
                        <Select
                            labelId="time-freq-main-label"
                            value={validTimeFrequency} // Use the validated value
                            label="Time Period"
                            onChange={onTimeFrequencyChange}
                        >
                            {timeFrequencyOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid
                    item
                    width={{
                        xs: '49.5%',
                        sm: '49.5%',
                        md: '24.5%',
                        lg: '24.5%',
                        xl: '24.5%'
                    }}>
                    <FormControl size="small" fullWidth>
                        <InputLabel id="subject-filter-label">Subject</InputLabel>
                        <Select
                            labelId="subject-filter-label"
                            value={selectedSubject}
                            label="Subject"
                            onChange={onSubjectChange}
                            disabled={!allSubjects || allSubjects.length === 0}
                        >
                            <MenuItem value="all">All Subjects</MenuItem>
                            {allSubjects.map(subj => <MenuItem key={subj.subjectKey} value={subj.subjectKey}>{subj.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Paper>
    );
}

export default DashboardControls;