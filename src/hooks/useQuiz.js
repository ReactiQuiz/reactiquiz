// src/hooks/useQuiz.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions, shuffleArray } from '../utils/quizUtils';

// --- Fetcher for a secure quiz session ---
const fetchQuizBySessionId = async (sessionId) => {
    if (!sessionId) return null;
    const { data } = await apiClient.get(`/api/quiz-sessions/${sessionId}`);
    // The backend now returns { questions, context }
    return data;
};

// --- Mutation function for saving result (unchanged) ---
const saveQuizResult = async (resultPayload) => {
    const { data } = await apiClient.post('/api/results', resultPayload);
    return data;
};

export const useQuiz = () => {
    const { currentUser } = useAuth();
    const { quizId: sessionId } = useParams(); // The URL param is now the session ID
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- Local UI State ---
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [quizContext, setQuizContext] = useState({}); // Will be populated from the fetched context

    // --- Data Fetching with useQuery based on session ID ---
    const { 
        data: sessionData, 
        isLoading, 
        isError, 
        error 
    } = useQuery({
        queryKey: ['quiz', sessionId],
        queryFn: () => fetchQuizBySessionId(sessionId),
        enabled: !!sessionId,
        retry: false, // Don't retry if a session is invalid/expired
    });

    // --- Mutation for saving result ---
    const saveResultMutation = useMutation({
        mutationFn: saveQuizResult,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['userResults', currentUser?.id] });
            queryClient.invalidateQueries({ queryKey: ['userStats', currentUser?.id] });
            
            const realResultId = data.id;
            if (!realResultId) throw new Error("API did not return a valid result ID after saving.");
            
            navigate(`/results/${realResultId}`);
        },
    });

    // Effect to process fetched questions and context
    useEffect(() => {
        if (sessionData) {
            const { questions: fetchedQuestions, context } = sessionData;
            
            // Apply client-side filtering/shuffling for standard quizzes
            let finalQuestions = fetchedQuestions;
            if (context.quizType !== 'homibhabha-practice') {
                 if (context.difficulty !== 'mixed') {
                    let minScore = 0, maxScore = Infinity;
                    if (context.difficulty === 'easy') { minScore = 10; maxScore = 13; }
                    else if (context.difficulty === 'medium') { minScore = 14; maxScore = 17; }
                    else if (context.difficulty === 'hard') { minScore = 18; maxScore = 20; }
                    const difficultyFiltered = finalQuestions.filter(q => q.difficulty >= minScore && q.difficulty <= maxScore);
                    if (difficultyFiltered.length > 0) finalQuestions = difficultyFiltered;
                }
                finalQuestions = shuffleArray(finalQuestions).slice(0, context.numQuestions);
            }

            setQuestions(parseQuestionOptions(finalQuestions));
            setQuizContext(context);
            setUserAnswers({});
            setElapsedTime(0);
            if (finalQuestions.length > 0) {
                setTimerActive(true);
            }
        }
    }, [sessionData]);

    // Timer logic (unchanged)
    useEffect(() => {
        let interval;
        if (timerActive && questions.length > 0) {
            interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, questions.length]);

    // Submit logic (now uses quizContext)
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