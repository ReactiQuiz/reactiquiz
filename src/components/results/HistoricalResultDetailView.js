// src/components/results/HistoricalResultDetailView.js
import React from 'react';
import { Box, Button, Paper, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuizResultSummary from './QuizResultSummary';
import QuestionBreakdown from './QuestionBreakdown';
import { useSubjectColors } from '../../contexts/SubjectColorsContext';

function HistoricalResultDetailView({ detailData, navigate }) {
    const { getColor } = useSubjectColors();
    
    if (!detailData || !detailData.result) {
        return <Alert severity="warning">Result data is not available.</Alert>;
    }

    const { result, detailedQuestions } = detailData;
    const accentColor = getColor(result.subject);

    return (
        <Paper elevation={0} sx={{backgroundColor: 'transparent'}}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/results')}
                sx={{ mb: 2 }}
            >
                Back to History
            </Button>
            
            <QuizResultSummary
                quizResult={result}
                quizTitle="Quiz Details"
                accentColor={accentColor}
            />
            
            <QuestionBreakdown
                detailedQuestions={detailedQuestions}
                accentColor={accentColor}
            />
        </Paper>
    );
}

export default HistoricalResultDetailView;