// src/pages/SubjectiveResultPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Divider, CircularProgress, Alert, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import apiClient from '../api/axiosInstance';

// A read-only component to display the user's answer
const ReadOnlyEditor = ({ content }) => {
    const editor = useEditor({
        editable: false,
        content: content || '',
        extensions: [StarterKit],
        editorProps: { attributes: { class: 'prose prose-invert max-w-none' } },
    });
    return <EditorContent editor={editor} />;
};

function SubjectiveResultPage() {
    const { resultId } = useParams();
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchResult = useCallback(async () => {
        try {
            const response = await apiClient.get(`/api/subjective/results/${resultId}`);
            const data = response.data;
            // Parse the inner JSON
            data.questions_and_answers = JSON.parse(data.questions_and_answers);
            setResult(data);

            // If still pending, set up polling to re-fetch
            if (data.grading_status === 'pending') {
                setTimeout(fetchResult, 5000); // Check again in 5 seconds
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch results.');
        } finally {
            setIsLoading(false);
        }
    }, [resultId]);

    useEffect(() => {
        fetchResult();
    }, [fetchResult]);

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }
    if (!result) return null;

    return (
        <Box sx={{ maxWidth: '900px', mx: 'auto', p: { xs: 1, sm: 2, md: 3 } }}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                <Typography variant="h4">Graded Paper: {result.topicName}</Typography>
                {result.grading_status === 'pending' && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Grading in progress... Our AI assistant is reviewing your answers. This page will update automatically when it's complete.
                    </Alert>
                )}
                 {result.grading_status === 'completed' && (
                    <Typography variant="h5" sx={{ mt: 2, color: 'success.main' }}>
                        Total Score: {result.total_marks_awarded} / {result.total_max_marks}
                    </Typography>
                )}
            </Paper>

            {result.questions_and_answers.map((item, index) => (
                <Paper key={item.questionId} variant="outlined" sx={{ mb: 3 }}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                         <Typography fontWeight="medium">Question {index + 1}</Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                        <Typography sx={{ mb: 2 }}>{/* We'd need to fetch question_text here, for now use ID */ item.questionId}</Typography>
                        <Typography variant="subtitle2" color="text.secondary">Your Answer:</Typography>
                        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, mb: 2 }}>
                            <ReadOnlyEditor content={item.userAnswer} />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        {item.grading_status === 'pending' || !item.feedback ? (
                             <Box sx={{display: 'flex', alignItems: 'center'}}><CircularProgress size={20} sx={{mr: 1}}/> <Typography>Awaiting Grade...</Typography></Box>
                        ) : (
                            <Box>
                                <Typography variant="h6">Result: <Chip label={`${item.score_awarded} / ${item.marks}`} color="primary" /></Typography>
                                <Typography sx={{mt: 1, fontStyle: 'italic'}}>{item.feedback.feedback_summary}</Typography>
                                <List dense>
                                    {item.feedback.positive_points?.map((point, i) => (
                                        <ListItem key={i}><ListItemIcon sx={{minWidth: 32}}><CheckCircleIcon color="success"/></ListItemIcon><ListItemText primary={point}/></ListItem>
                                    ))}
                                    {item.feedback.areas_for_improvement?.map((point, i) => (
                                        <ListItem key={i}><ListItemIcon sx={{minWidth: 32}}><ReportProblemIcon color="warning"/></ListItemIcon><ListItemText primary={point}/></ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </Box>
                </Paper>
            ))}
        </Box>
    );
}

export default SubjectiveResultPage;