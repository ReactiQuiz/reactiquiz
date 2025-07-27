// src/pages/QuizLoadingPage.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Box, CircularProgress, Typography } from '@mui/material';
import apiClient from '../api/axiosInstance';

// This is the same fetcher function from useQuiz, now used for pre-fetching
const fetchQuizBySessionId = async (sessionId) => {
    if (!sessionId) return null;
    const { data } = await apiClient.get(`/api/quiz-sessions/${sessionId}`);
    return data;
};

function QuizLoadingPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const startQuiz = async () => {
            // 1. Get the session ID from localStorage
            const sessionId = localStorage.getItem('activeQuizSessionId');
            
            if (!sessionId) {
                navigate('/subjects', { state: { error: 'No active quiz session found.' } });
                return;
            }

            try {
                // 2. Pre-fetch the quiz data and seed the cache
                await queryClient.prefetchQuery({
                    queryKey: ['quiz', sessionId],
                    queryFn: () => fetchQuizBySessionId(sessionId),
                });

                // 3. Navigate to the actual quiz page
                navigate(`/quiz/${sessionId}`, { replace: true });
                // We DON'T remove the localStorage item here. It will be cleared
                // when the user starts a NEW quiz, preventing refresh issues.

            } catch (error) {
                console.error("Failed to pre-fetch quiz data:", error);
                const errorMessage = error.response?.data?.message || 'Failed to load quiz data.';
                // On failure, clear the bad session ID and send the user back with an error
                localStorage.removeItem('activeQuizSessionId');
                navigate('/subjects', { state: { error: errorMessage } });
            }
        };

        startQuiz();
    }, [navigate, queryClient]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
                Preparing your quiz...
            </Typography>
        </Box>
    );
}

export default QuizLoadingPage;