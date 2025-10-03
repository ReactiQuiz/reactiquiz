// src/components/dashboard/DashboardEmptyState.tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import LiquidGlassButton from '../animations/LiquidGlassButton';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate } from 'react-router-dom';
import DashboardControls from './DashboardControls';
import { DashboardEmptyStateProps } from '../../types';

const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ 
  currentUser, 
  timeFrequency, 
  onTimeFrequencyChange, 
  allSubjects, 
  selectedSubject, 
  onSubjectChange 
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 2, px: { xs: 1, sm: 2 }, width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
        My Dashboard
      </Typography>
      <DashboardControls
        timeFrequency={timeFrequency}
        onTimeFrequencyChange={onTimeFrequencyChange}
        allSubjects={allSubjects}
        selectedSubject={selectedSubject}
        onSubjectChange={onSubjectChange}
      />
      <Paper sx={{ p: 4, mt: 4, mx: 'auto', maxWidth: '600px', textAlign: 'center' }}>
        <BarChartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>Welcome, {currentUser.name}!</Typography>
        <Typography sx={{ my: 2, color: 'text.secondary' }}>
          Your dashboard is ready. Complete a quiz to start seeing your performance analytics here.
        </Typography>
        <LiquidGlassButton variant="accent" size="large" onClick={() => navigate('/subjects')} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          Explore Quizzes
        </LiquidGlassButton>
      </Paper>
    </Box>
  );
};

export default DashboardEmptyState;
