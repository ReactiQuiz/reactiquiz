// src/components/results/HistoricalResultDetailView.js
import React from 'react';
import { Box, Button, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuizResultSummary from './QuizResultSummary';
import QuestionBreakdown from './QuestionBreakdown';

function HistoricalResultDetailView({ detailData }) {
    const navigate = useNavigate();
    
    // Check if data is still loading or missing
    if (!detailData || !detailData.result) {
        return <Alert severity="warning">Result data is not available.</Alert>;
    }

    const { result, detailedQuestions } = detailData;

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
                quizResult={result} // Pass the full result object
                quizTitle="Quiz Details"
            />
            
            <QuestionBreakdown
                detailedQuestions={detailedQuestions} // Pass the processed questions
            />
        </Paper>
    );
}

export default HistoricalResultDetailView;