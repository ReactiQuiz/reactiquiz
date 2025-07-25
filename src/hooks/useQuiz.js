// src/hooks/useQuiz.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions, shuffleArray } from '../utils/quizUtils';

// Standard Topic Fetcher (Unchanged)
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
        throw new Error(`No questions found for topic "${topicId}" with the selected filters.`);
    }
    return shuffleArray(questions).slice(0, numQuestionsReq);
};

// --- START OF NEW HIERARCHICAL COMPOSITE QUIZ FETCHER ---
const fetchCompositeQuizQuestions = async (composition) => {
    const { data: allTopics } = await apiClient.get('/api/topics');

    const allSubjectQuestionArrays = await Promise.all(
        Object.entries(composition).map(async ([subjectKey, rules]) => {
            let subjectQuestions = [];
            const gatheredQuestionIds = new Set();
            const priorityOrder = ['9th', '8th', '7th'];

            for (const grade of priorityOrder) {
                if (subjectQuestions.length >= rules.total) break;

                const needed = rules.total - subjectQuestions.length;
                const topicIds = allTopics
                    .filter(t => t.subject === subjectKey && t.class === grade)
                    .map(t => t.id);

                if (topicIds.length === 0) continue;

                const responses = await Promise.all(topicIds.map(id => apiClient.get(`/api/questions?topicId=${id}`)));
                let newQuestions = responses.flatMap(res => res.data);
                
                newQuestions = newQuestions.filter(q => !gatheredQuestionIds.has(q.id));

                if (newQuestions.length > 0) {
                    const questionsToAdd = shuffleArray(newQuestions).slice(0, needed);
                    subjectQuestions.push(...questionsToAdd);
                    questionsToAdd.forEach(q => gatheredQuestionIds.add(q.id));
                }
            }
            // This part handles GK which has no specific class priority
            if (subjectKey === 'gk' && subjectQuestions.length < rules.total) {
                const needed = rules.total - subjectQuestions.length;
                const topicIds = allTopics.filter(t => t.subject === 'gk').map(t => t.id);
                 if (topicIds.length > 0) {
                    const responses = await Promise.all(topicIds.map(id => apiClient.get(`/api/questions?topicId=${id}`)));
                    let newQuestions = responses.flatMap(res => res.data);
                    newQuestions = newQuestions.filter(q => !gatheredQuestionIds.has(q.id));
                    const questionsToAdd = shuffleArray(newQuestions).slice(0, needed);
                    subjectQuestions.push(...questionsToAdd);
                }
            }
            return subjectQuestions;
        })
    );
    
    const finalQuestionList = allSubjectQuestionArrays.flat();
    const totalRequired = Object.values(composition).reduce((acc, rule) => acc + rule.total, 0);

    if (finalQuestionList.length < totalRequired) {
        throw new Error(`Could not assemble the practice test. Only found ${finalQuestionList.length} of ${totalRequired} required questions.`);
    }

    return parseQuestionOptions(shuffleArray(finalQuestionList));
};
// --- END OF NEW FETCHER ---

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
    const { quizType, questionComposition, difficulty, numQuestions } = quizSettings;

    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    const { 
        data: fetchedQuestions = [], 
        isLoading, isError, error 
    } = useQuery({
        queryKey: ['quizQuestions', topicIdFromParams, quizSettings],
        queryFn: () => {
            if (quizType === 'homibhabha-practice' && questionComposition) {
                return fetchCompositeQuizQuestions(questionComposition);
            }
            return fetchTopicQuestions(topicIdFromParams, difficulty, numQuestions);
        },
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