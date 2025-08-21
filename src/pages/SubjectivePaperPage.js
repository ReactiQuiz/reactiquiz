// src/pages/SubjectivePaperPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Divider, Stack } from '@mui/material';
import apiClient from '../api/axiosInstance';
import RichTextEditor from '../components/subjective/RichTextEditor';

function SubjectivePaperPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // In a real app, you would fetch both topic details and questions
    // For now, we just fetch questions.
    const fetchPaper = async () => {
        setIsLoading(true);
        try {
            // This is a placeholder for the real API endpoint we'll build in Phase 3
            // const response = await apiClient.get(`/api/subjective-questions/${topicId}`);
            // setQuestions(response.data.questions);
            // setTopic(response.data.topic);

            // --- MOCK DATA FOR UI DEVELOPMENT ---
            // Replace this with the API call above once the backend is ready
            setTimeout(() => {
                setTopic({ id: topicId, name: topicId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) });
                setQuestions([
                    { id: 'heat-7th-sq001', topic_id: topicId, question_text: "Define 'latent heat of vaporization'.", marks: 2, difficulty: 14 },
                    { id: 'heat-7th-sq002', topic_id: topicId, question_text: "Explain the process of convection with an example.", marks: 3, difficulty: 16 },
                ]);
                setIsLoading(false);
            }, 1000);
            // --- END OF MOCK DATA ---

        } catch (err) {
            setError(err.response?.data?.message || `Failed to load paper for ${topicId}`);
            setIsLoading(false);
        }
    };
    fetchPaper();
  }, [topicId]);

  const handleAnswerUpdate = (questionId, content) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: content,
    }));
  };

  const handleSubmit = async () => {
      setIsSubmitting(true);
      const submissionPayload = {
          topicId: topic.id,
          answers: questions.map(q => ({
              questionId: q.id,
              userAnswer: userAnswers[q.id] || {}, // Send empty object if not answered
          }))
      };
      
      console.log("Submitting Payload:", JSON.stringify(submissionPayload, null, 2));
      
      // In Phase 3, we will implement this API call:
      // await apiClient.post('/api/subjective-results/submit', submissionPayload);
      
      setTimeout(() => {
          alert("Submission logic will be implemented in the next phase! Check the browser console for the payload.");
          setIsSubmitting(false);
          // navigate(`/subjective-result/some-new-id`);
      }, 1000);
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