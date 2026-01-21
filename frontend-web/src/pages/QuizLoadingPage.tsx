// src/pages/QuizLoadingPage.tsx
/**
 * Quiz Loading Page
 * 
 * This page acts as an intermediate loading step between quiz session
 * creation and the actual quiz page. It pre-fetches quiz data and
 * navigates to the quiz page once data is ready, improving user experience.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Box, CircularProgress, Typography } from '@mui/material';
import apiClient from '../api/axiosInstance';

/**
 * Fetch Quiz By Session ID
 * 
 * Fetches quiz session data from the API using the session ID.
 * This function is used for pre-fetching quiz data into React Query cache.
 * 
 * @param {string} sessionId - The quiz session identifier
 * @returns {Promise<any>} Promise that resolves to quiz session data or null
 */
const fetchQuizBySessionId = async (sessionId) => {
    if (!sessionId) return null;
    const { data } = await apiClient.get(`/api/quizSessions/${sessionId}`);
    return data;
};

/**
 * Quiz Loading Page Component
 * 
 * Handles quiz session pre-fetching and navigation:
 * 1. Retrieves session ID from localStorage
 * 2. Pre-fetches quiz data using React Query
 * 3. Seeds the cache for instant loading on quiz page
 * 4. Navigates to quiz page once data is ready
 * 5. Handles errors with cleanup and redirect
 * 
 * This page is only accessible to authenticated users with an
 * active quiz session stored in localStorage.
 * 
 * @returns {JSX.Element} Loading page with spinner and message
 */
function QuizLoadingPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    /**
     * Start Quiz Effect
     * 
     * Pre-fetches quiz data and navigates to quiz page:
     * 1. Gets session ID from localStorage
     * 2. Validates session ID exists
     * 3. Pre-fetches quiz data with React Query
     * 4. Navigates to quiz page on success
     * 5. Cleans up and redirects on error
     */
    useEffect(() => {
        const startQuiz = async () => {
            // Get the session ID from localStorage (set during quiz creation)
            const sessionId = localStorage.getItem('activeQuizSessionId');
            // console.log('Retrieved sessionId from localStorage:', sessionId);
            
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