// src/hooks/useQuiz.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions } from '../utils/quizUtils';

// Fetcher for a secure quiz session
const fetchQuizBySessionId = async (sessionId) => {
    if (!sessionId) return null;
    const { data } = await apiClient.get(`/api/quiz-sessions/${sessionId}`);
    // Backend now returns the exact questions and context needed
    return data;
};

// Mutation function for saving result
const saveQuizResult = async (resultPayload) => {
    const { data } = await apiClient.post('/api/results', resultPayload);
    return data;
};

export const useQuiz = () => {
    const { currentUser } = useAuth();
    const { quizId: sessionId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [quizContext, setQuizContext] = useState({});

    const { 
        data: sessionData, 
        isLoading, 
        isError, 
        error 
    } = useQuery({
        queryKey: ['quiz', sessionId],
        queryFn: () => fetchQuizBySessionId(sessionId),
        enabled: !!sessionId,
        retry: false,
    });

    const saveResultMutation = useMutation({
        mutationFn: saveQuizResult,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['userResults', currentUser?.id] });
            queryClient.invalidateQueries({ queryKey: ['userStats', currentUser?.id] });
            
            const realResultId = data.id;
            if (!realResultId) throw new Error("API did not return a valid result ID.");
            
            navigate(`/results/${realResultId}`);
        },
    });

    // --- START OF FIX: Simplified useEffect ---
    // No more client-side filtering needed!
    useEffect(() => {
        if (sessionData) {
            const { questions: fetchedQuestions, context } = sessionData;
            
            setQuestions(parseQuestionOptions(fetchedQuestions));
            setQuizContext(context);
            setUserAnswers({});
            setElapsedTime(0);
            if (fetchedQuestions.length > 0) {
                setTimerActive(true);
            }
        }
    }, [sessionData]);
    // --- END OF FIX ---

    // Timer logic (unchanged)
    useEffect(() => {
        let interval;
        if (timerActive && questions.length > 0) {
            interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, questions.length]);

    // Submit logic (unchanged)
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