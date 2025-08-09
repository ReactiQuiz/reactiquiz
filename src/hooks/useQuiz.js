// src/hooks/useQuiz.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions } from '../utils/quizUtils';
import { useNotifications } from '../contexts/NotificationsContext';

const fetchQuizBySessionId = async (sessionId) => {
    if (!sessionId) return null;
    const { data } = await apiClient.get(`/api/quiz-sessions/${sessionId}`);
    return data;
};

// --- START OF CHANGE 1: Update the mutation function ---
// It no longer sends score/percentage.
const saveQuizResult = async (resultPayload) => {
    const { data } = await apiClient.post('/api/results', resultPayload);
    return data; // The backend will now return the full result object, including the new result ID
};
// --- END OF CHANGE 1 ---

export const useQuiz = () => {
    const { currentUser } = useAuth();
    const { quizId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { addNotification } = useNotifications(); 

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

    const saveResultMutation = useMutation({
        mutationFn: saveQuizResult,
        // --- START OF CHANGE 2: Update the onSuccess handler ---
        onSuccess: async (data) => {
            // The backend now returns the saved result data, including its new ID.
            const { resultId, savedResult } = data;
            
            // Invalidate queries to ensure dashboard/history is fresh
            await queryClient.invalidateQueries({ queryKey: ['userResults', currentUser?.id] });
            await queryClient.invalidateQueries({ queryKey: ['userStats', currentUser?.id] });
            
            // Navigate to the results page for the specific result we just created.
            // Pass the full result data in the state to avoid a re-fetch.
            navigate(`/results/${resultId}`, { state: { justFinished: true, resultData: savedResult } });
        },
        // --- END OF CHANGE 2 ---
        onError: (err) => {
            const message = err.response?.data?.message || "Failed to save your quiz result. Please try again.";
            addNotification(message, 'error');
        }
    });

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

        // --- START OF CHANGE 3: Remove frontend score calculation ---
        // const correctAnswers = questions.reduce((acc, q) => (userAnswers[q.id] === q.correctOptionId ? acc + 1 : acc), 0);
        // const percentage = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
        
        saveResultMutation.mutate({
            // Send only the raw data. The backend will calculate the rest.
            quizContext: quizContext, // Send the whole context for topicId, subject, etc.
            timeTaken: elapsedTime,
            questionsActuallyAttemptedIds: questions.map(q => q.id),
            userAnswersSnapshot: userAnswers,
        });
        // --- END OF CHANGE 3 ---
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