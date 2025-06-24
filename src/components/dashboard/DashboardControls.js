// src/components/dashboard/DashboardControls.js
import React from 'react';
import { Paper, Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const timeFrequencyOptions = [
  { value: 7, label: 'Last 7 Days' },
  { value: 30, label: 'Last 30 Days' },
  { value: 90, label: 'Last 90 Days' },
  { value: 365, label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

function DashboardControls({ timeFrequency, onTimeFrequencyChange }) {
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Typography variant="h6" color="text.primary">Dashboard Controls</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="time-freq-main-label">Time Period</InputLabel>
          <Select
            labelId="time-freq-main-label"
            value={timeFrequency}
            label="Time Period"
            onChange={onTimeFrequencyChange}
          >
            {timeFrequencyOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Typography variant="caption" sx={{ display: 'block', textAlign: 'left', color: 'text.secondary' }}>
        Results data is updated periodically.
      </Typography>
    </Paper>
  );
}

export default DashboardControls;