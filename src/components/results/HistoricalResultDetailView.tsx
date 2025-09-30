// src/components/results/HistoricalResultDetailView.tsx
import React from 'react';
import { Button, Paper, Alert } from '@mui/material';
import QuizResultSummary from './QuizResultSummary';
import QuestionBreakdown from './QuestionBreakdown';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';
import { QuizResult } from '../../types';

interface HistoricalResultDetailViewProps {
  resultId: string;
  onBack: () => void;
  accentColor: string;
}

const HistoricalResultDetailView: React.FC<HistoricalResultDetailViewProps> = ({ 
  resultId, 
  onBack, 
  accentColor 
}) => {
  const { getColor } = useSubjectColors();
  
  // For now, we'll show a placeholder since we need to fetch the data
  // This should be updated to use the resultId to fetch the data
  return (
    <Paper elevation={0} sx={{ backgroundColor: 'transparent' }}>
      <Button
        onClick={onBack}
        sx={{ mb: 2 }}
      >
        &larr; Back to History
      </Button>
      
      <Alert severity="info">
        Result detail view for ID: {resultId}
      </Alert>
    </Paper>
  );
};

export default HistoricalResultDetailView;
