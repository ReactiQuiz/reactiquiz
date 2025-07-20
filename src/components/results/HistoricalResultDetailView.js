// src/components/results/HistoricalResultDetailView.js
import React from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuizResultSummary from './QuizResultSummary';
import QuestionBreakdown from './QuestionBreakdown';

function HistoricalResultDetailView({ detailData }) {
    const navigate = useNavigate();
    const { result, detailedQuestions } = detailData;

    if (!result) {
        return <Alert severity="warning">Result data is not available.</Alert>;
    }

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
            />
            
            <QuestionBreakdown
                detailedQuestionsToDisplay={detailedQuestions}
            />
        </Paper>
    );
}

export default HistoricalResultDetailView;