// src/hooks/useQuiz.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions, shuffleArray } from '../utils/quizUtils';

// --- Standard Topic Fetcher (Unchanged) ---
const fetchTopicQuestions = async (topicId, difficultyLabel, numQuestionsReq) => {
    if (!topicId) return [];
    const { data } = await apiClient.get(`/api/questions?topicId=${topicId}`);
    let questions = parseQuestionOptions(data || []);

    if (difficultyLabel !== 'mixed') {
        let minScore = 0, maxScore = Infinity;
        if (difficultyLabel === 'easy') { minScore = 10; maxScore = 13; }
        else if (difficultyLabel === 'medium') { minScore = 14; maxScore = 17; }
        else if (difficultyLabel === 'hard') { minScore = 18; maxScore = 20; }
        const difficultyFiltered = questions.filter(q => q.difficulty >= minScore && q.difficulty <= maxScore);
        if (difficultyFiltered.length > 0) questions = difficultyFiltered;
    }
    
    if (questions.length === 0) {
        // Let the hook handle the error message for better UI feedback
        throw new Error(`No questions found for topic "${topicId}" with the selected filters.`);
    }
    return shuffleArray(questions).slice(0, numQuestionsReq);
};

// --- START OF NEW COMPOSITE QUIZ FETCHER ---
const fetchCompositeQuizQuestions = async (composition, mainClass) => {
    // 1. Fetch all topics to filter by subject and class
    const { data: allTopics } = await apiClient.get('/api/topics');

    const fetchPromises = Object.entries(composition).map(async ([subjectKey, rules]) => {
        let subjectQuestions = [];

        // Fetch questions for 7th grade topics if needed
        if (rules.class_7 > 0) {
            const topicIds = allTopics.filter(t => t.subject === subjectKey && t.class === '7th').map(t => t.id);
            if (topicIds.length > 0) {
                const responses = await Promise.all(topicIds.map(id => apiClient.get(`/api/questions?topicId=${id}`)));
                const questions = responses.flatMap(res => res.data);
                subjectQuestions.push(...shuffleArray(questions).slice(0, rules.class_7));
            }
        }
        
        // Fetch questions for 8th grade topics if needed
        if (rules.class_8 > 0) {
            const topicIds = allTopics.filter(t => t.subject === subjectKey && t.class === '8th').map(t => t.id);
            if (topicIds.length > 0) {
                const responses = await Promise.all(topicIds.map(id => apiClient.get(`/api/questions?topicId=${id}`)));
                const questions = responses.flatMap(res => res.data);
                subjectQuestions.push(...shuffleArray(questions).slice(0, rules.class_8));
            }
        }

        // Calculate remaining questions needed for the main class (e.g., 9th)
        const remainingNeeded = rules.total - subjectQuestions.length;
        if (remainingNeeded > 0) {
            const mainClassSuffix = mainClass.endsWith('th') ? mainClass : `${mainClass}th`;
            const topicIds = allTopics.filter(t => t.subject === subjectKey && t.class === mainClassSuffix).map(t => t.id);
             if (topicIds.length > 0) {
                const responses = await Promise.all(topicIds.map(id => apiClient.get(`/api/questions?topicId=${id}`)));
                const questions = responses.flatMap(res => res.data);
                subjectQuestions.push(...shuffleArray(questions).slice(0, remainingNeeded));
            }
        }

        // Graceful Fallback: If we still don't have enough, grab any from the subject
        if (subjectQuestions.length < rules.total) {
            const fallbackNeeded = rules.total - subjectQuestions.length;
            const allSubjectTopicIds = allTopics.filter(t => t.subject === subjectKey).map(t => t.id);
            if (allSubjectTopicIds.length > 0) {
                const responses = await Promise.all(allSubjectTopicIds.map(id => apiClient.get(`/api/questions?topicId=${id}`)));
                const fallbackQuestions = responses.flatMap(res => res.data).filter(q => !subjectQuestions.some(sq => sq.id === q.id)); // Exclude already picked
                subjectQuestions.push(...shuffleArray(fallbackQuestions).slice(0, fallbackNeeded));
            }
        }

        return subjectQuestions;
    });

    const allSubjectQuestionArrays = await Promise.all(fetchPromises);
    const finalQuestionList = allSubjectQuestionArrays.flat();

    if (finalQuestionList.length === 0) {
        throw new Error("Could not assemble the practice test. No questions found for the required subjects.");
    }

    return parseQuestionOptions(shuffleArray(finalQuestionList));
};
// --- END OF NEW COMPOSITE QUIZ FETCHER ---

const saveQuizResult = async (resultPayload) => {
    const { data } = await apiClient.post('/api/results', resultPayload);
    return data;
};

export const useQuiz = () => {
    const { currentUser } = useAuth();
    const { topicId: topicIdFromParams } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const quizSettings = location.state || {};
    const { quizType, questionComposition, quizClass, difficulty, numQuestions } = quizSettings;

    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    const { 
        data: fetchedQuestions = [], 
        isLoading, isError, error 
    } = useQuery({
        queryKey: ['quizQuestions', topicIdFromParams, quizSettings],
        // --- START OF FIX: CONDITIONAL FETCHER ---
        queryFn: () => {
            if (quizType === 'homibhabha-practice' && questionComposition) {
                return fetchCompositeQuizQuestions(questionComposition, quizClass);
            }
            // Add other special quiz types here in the future (e.g., 'homibhabha-pyq')
            // Default to standard topic fetcher
            return fetchTopicQuestions(topicIdFromParams, difficulty, numQuestions);
        },
        // --- END OF FIX ---
        enabled: !!topicIdFromParams,
    });

    const saveResultMutation = useMutation({
        mutationFn: saveQuizResult,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['userResults'] });
            queryClient.invalidateQueries({ queryKey: ['userStats'] });
            queryClient.invalidateQueries({ queryKey: ['recentResultsForChallenge'] });
            
            const realResultId = data.id;
            if (!realResultId) throw new Error("API did not return a valid result ID.");
            
            navigate(`/results/${realResultId}`);
        },
    });

    useEffect(() => {
        if (!isLoading && !isError) {
            setQuestions(fetchedQuestions);
            setUserAnswers({});
            setElapsedTime(0);
            if (fetchedQuestions.length > 0) {
                setTimerActive(true);
            }
        }
    }, [fetchedQuestions, isLoading, isError]);
    
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
            navigate(quizSettings.subject ? `/subjects/${quizSettings.subject}` : '/subjects');
            return;
        }
        
        if (!currentUser) {
            alert("You must be logged in to save results.");
            return;
        }

        const correctAnswers = questions.reduce((acc, q) => (userAnswers[q.id] === q.correctOptionId ? acc + 1 : acc), 0);
        const percentage = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
        
        saveResultMutation.mutate({
            subject: quizSettings.subject, topicId: topicIdFromParams,
            score: correctAnswers, totalQuestions: questions.length, percentage,
            timeTaken: elapsedTime,
            questionsActuallyAttemptedIds: questions.map(q => q.id),
            userAnswersSnapshot: userAnswers,
            difficulty: quizSettings.difficulty,
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
        error: isError ? error.message : (saveResultMutation.isError ? saveResultMutation.error.message : null),
        infoMessage: '',
        elapsedTime, timerActive, 
        isSubmitting: saveResultMutation.isPending,
        quizContext: { ...quizSettings, topicId: topicIdFromParams },
        handleOptionSelect, submitAndNavigate, handleAbandonQuiz
    };
};