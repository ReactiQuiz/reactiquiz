// src/hooks/useQuiz.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions } from '../utils/quizUtils';

// Fetcher and save functions (unchanged)
const fetchQuizBySessionId = async (sessionId) => {
    if (!sessionId) return null;
    const { data } = await apiClient.get(`/api/quiz-sessions/${sessionId}`);
    return data;
};
const saveQuizResult = async (resultPayload) => {
    const { data } = await apiClient.post('/api/results', resultPayload);
    return data;
};

export const useQuiz = () => {
    const { currentUser } = useAuth();
    const { quizId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [quizContext, setQuizContext] = useState({});

    const { data: sessionData, isLoading, isError, error } = useQuery({
        queryKey: ['quiz', quizId],
        queryFn: () => fetchQuizBySessionId(quizId),
        enabled: !!quizId,
        retry: false,
    });

    // --- START OF FIX: Updated mutation logic ---
    const saveResultMutation = useMutation({
        mutationFn: saveQuizResult,
        onSuccess: async (data) => {
            // 1. Wait for the query invalidation to complete.
            // This ensures that the next time the results list is needed, it WILL refetch.
            await queryClient.invalidateQueries({ queryKey: ['userResults', currentUser?.id] });
            await queryClient.invalidateQueries({ queryKey: ['userStats', currentUser?.id] });
            
            // 2. Navigate to the main results list page.
            navigate('/results');
        },
        onError: (err) => {
            console.error("Failed to save result:", err);
            // Error handling can be enhanced here if needed
        }
    });
    // --- END OF FIX ---

    useEffect(() => {
        if (!isLoading && !isError && sessionData) {
            const { questions: fetchedQuestions, context } = sessionData;
            if (fetchedQuestions && fetchedQuestions.length > 0) {
                setQuestions(parseQuestionOptions(fetchedQuestions));
                setQuizContext(context);
                setUserAnswers({});
                setElapsedTime(0);
                setTimerActive(true);
            } else {
                setQuestions([]);
            }
        }
    }, [sessionData, isLoading, isError]);
    
    useEffect(() => {
        let interval;
        if (timerActive && questions.length > 0) {
            interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, questions.length]);

    const submitAndNavigate = (abandon = false) => {
        setTimerActive(false);
        if (abandon) {
            navigate(quizContext.subject ? `/subjects/${quizContext.subject}` : '/subjects');
            return;
        }
        if (!currentUser || !quizContext.topicId) return;

        const correctAnswers = questions.reduce((acc, q) => (userAnswers[q.id] === q.correctOptionId ? acc + 1 : acc), 0);
        const percentage = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
        
        saveResultMutation.mutate({
            subject: quizContext.subject, topicId: quizContext.topicId,
            score: correctAnswers, totalQuestions: questions.length, percentage,
            timeTaken: elapsedTime,
            questionsActuallyAttemptedIds: questions.map(q => q.id),
            userAnswersSnapshot: userAnswers,
            difficulty: quizContext.difficulty,
        });
    };

    const handleOptionSelect = (questionId, selectedOptionId) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: selectedOptionId }));
    };



    const handleAbandonQuiz = () => {
        if (window.confirm("Are you sure? Your progress will be lost.")) {
            submitAndNavigate(true);
        }
    };

    return {
        questions, userAnswers, isLoading, 
        error: isError ? (error.response?.data?.message || error.message) : (saveResultMutation.isError ? saveResultMutation.error.message : null),
        infoMessage: '',
        elapsedTime, timerActive, 
        isSubmitting: saveResultMutation.isPending,
        quizContext: quizContext,
        handleOptionSelect, submitAndNavigate, handleAbandonQuiz
    };
};