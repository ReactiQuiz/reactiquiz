// src/pages/SubjectivePaperPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Divider, Stack } from '@mui/material';
import apiClient from '../api/axiosInstance';
import RichTextEditor from '../components/subjective/RichTextEditor';
import { useNotifications } from '../contexts/NotificationsContext';

function SubjectivePaperPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { addNotification } = useNotifications();

  const fetchPaper = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/api/subjective/paper/${topicId}`);
      setTopic(response.data.topic);
      setQuestions(response.data.questions);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to load paper for ${topicId}`);
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchPaper();
  }, [fetchPaper]);

  const handleAnswerUpdate = (questionId, content) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: content }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        const submissionPayload = {
            topicId: topic.id,
            answers: questions.map(q => ({
                questionId: q.id,
                userAnswer: userAnswers[q.id] || null,
            }))
        };
        const response = await apiClient.post('/api/subjective/submit', submissionPayload);
        addNotification('Paper submitted! Your results will be ready shortly.', 'success');
        navigate(`/subjective-result/${response.data.resultId}`);
    } catch (err) {
        addNotification(err.response?.data?.message || 'Failed to submit paper.', 'error');
        setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto', p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h4" gutterBottom>{topic?.name}</Typography>
        <Typography color="text.secondary">Answer the following questions to the best of your ability.</Typography>
      </Paper>

      <Stack spacing={4}>
        {questions.map((q, index) => (
          <Paper key={q.id} variant="outlined">
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight="medium">Question {index + 1}</Typography>
                <Typography color="text.secondary">Marks: {q.marks}</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
                <Typography sx={{ mb: 2 }}>{q.question_text}</Typography>
                <RichTextEditor
                    onUpdate={(content) => handleAnswerUpdate(q.id, content)}
                />
            </Box>
          </Paper>
        ))}
      </Stack>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleSubmit}
        disabled={isSubmitting}
        sx={{ mt: 4, py: 1.5 }}
      >
        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Paper for Grading'}
      </Button>
    </Box>
  );
}

export default SubjectivePaperPage;