// src/hooks/useQuiz.js
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions, shuffleArray } from '../utils/quizUtils';

// Helper to generate a URL-safe, secure random string
const generateSecureRandomId = (length = 16) => {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
};


// Helper functions (these are unchanged, provided for completeness)
const fetchAndFilterSubjectQuestionsForPractice = async (subjectName, targetClass, difficultyLabel, numQuestionsNeeded) => { try { const topicsResponse = await apiClient.get(`/api/topics/${subjectName.toLowerCase()}`); if (!Array.isArray(topicsResponse.data) || topicsResponse.data.length === 0) return []; const subjectTopicIds = topicsResponse.data.map(topic => topic.id); if (subjectTopicIds.length === 0) return []; let allQuestionsForSubject = []; for (const topicId of subjectTopicIds) { const questionsResponse = await apiClient.get(`/api/questions?topicId=${topicId}`); if (Array.isArray(questionsResponse.data)) { const correctTopicInfo = topicsResponse.data.find(t => t.id === topicId); allQuestionsForSubject.push(...questionsResponse.data.map(q => ({ ...q, subject: subjectName.toLowerCase(), class: q.class || correctTopicInfo?.class || null }))); } } if (allQuestionsForSubject.length === 0) return []; let classFiltered = targetClass ? allQuestionsForSubject.filter(q => !q.class || String(q.class) === String(targetClass)) : allQuestionsForSubject; if (classFiltered.length === 0 && targetClass) classFiltered = allQuestionsForSubject; if (difficultyLabel === 'mixed') return shuffleArray(classFiltered).slice(0, numQuestionsNeeded); let minScore = 0, maxScore = Infinity; if (difficultyLabel === 'easy') { minScore = 10; maxScore = 13; } else if (difficultyLabel === 'medium') { minScore = 14; maxScore = 17; } else if (difficultyLabel === 'hard') { minScore = 18; maxScore = 20; } let difficultyFiltered = classFiltered.filter(q => q.difficulty >= minScore && q.difficulty <= maxScore); if (difficultyFiltered.length === 0) difficultyFiltered = classFiltered; return shuffleArray(difficultyFiltered).slice(0, numQuestionsNeeded); } catch (error) { console.error(`[PracticeQuiz] Error fetching for ${subjectName}:`, error); return []; } };
const fetchHomiBhabhaPracticeQuestions = async (settings) => { const { quizClassFromState, difficultyLabel, questionComposition, desiredTotal } = settings; let finalQuizQuestions = [], infoMessages = []; for (const subjKey of ['physics', 'chemistry', 'biology', 'gk']) { if (questionComposition[subjKey]) { const fetched = await fetchAndFilterSubjectQuestionsForPractice(subjKey, quizClassFromState, difficultyLabel, questionComposition[subjKey]); finalQuizQuestions.push(...fetched); if (fetched.length < questionComposition[subjKey]) infoMessages.push(`Found ${fetched.length}/${questionComposition[subjKey]} ${subjKey} questions.`); } } const uniqueQuestions = Array.from(new Map(finalQuizQuestions.map(q => [q.id, q])).values()); if (uniqueQuestions.length === 0) throw new Error("Could not gather any questions for the practice test."); return { questions: shuffleArray(uniqueQuestions).slice(0, desiredTotal), info: infoMessages.join(' ') }; };
const fetchTopicQuestions = async (settings) => { const { topicId, quizClassFromState, difficultyLabel, numQuestionsReq, subject } = settings; const response = await apiClient.get(`/api/questions?topicId=${topicId}`); let questions = response.data; if (!Array.isArray(questions)) throw new Error("Invalid question data received."); if (quizClassFromState && subject && !['gk', 'mathematics'].includes(subject.toLowerCase())) { questions = questions.filter(q => !q.class || String(q.class) === String(quizClassFromState)); } if (difficultyLabel !== 'mixed') { let minScore = 0, maxScore = Infinity; if (difficultyLabel === 'easy') { minScore = 10; maxScore = 13; } else if (difficultyLabel === 'medium') { minScore = 14; maxScore = 17; } else if (difficultyLabel === 'hard') { minScore = 18; maxScore = 20; } const difficultyFiltered = questions.filter(q => q.difficulty >= minScore && q.difficulty <= maxScore); if (difficultyFiltered.length > 0) questions = difficultyFiltered; } if (questions.length === 0) throw new Error(`No questions found for topic "${topicId}" with the selected filters.`); return shuffleArray(questions).slice(0, numQuestionsReq); };
const fetchChallengeQuestions = async (challengeId, token) => { const response = await apiClient.get(`/api/challenges/${challengeId}`, { headers: { Authorization: `Bearer ${token}` } }); if (!response.data || !Array.isArray(response.data.question_ids)) throw new Error('Challenge data is invalid.'); const topicQuestionsResponse = await apiClient.get(`/api/questions?topicId=${response.data.topic_id}`); const allTopicQuestions = topicQuestionsResponse.data; if (!Array.isArray(allTopicQuestions)) throw new Error('Invalid question data for challenge topic.'); const questionDetails = response.data.question_ids.map(id => allTopicQuestions.find(q => q.id === id)).filter(Boolean); if (questionDetails.length === 0) throw new Error("No valid questions found for this challenge."); return { challengeData: response.data, questions: questionDetails.map(q => ({...q, subject: response.data.subject, class: response.data.quiz_class})) }; };

export const useQuiz = () => {
  const { currentUser } = useAuth();
  const { topicId: topicIdFromParams, challengeId: challengeIdFromParams } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const quizSettings = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizContext, setQuizContext] = useState({});

  const getStorageKey = useCallback(() => {
    if (!currentUser?.id || (!topicIdFromParams && !challengeIdFromParams)) return null;
    const key = challengeIdFromParams ? `challenge-${challengeIdFromParams}` : topicIdFromParams;
    return `quiz-in-progress-${currentUser.id}-${key}`;
  }, [currentUser?.id, topicIdFromParams, challengeIdFromParams]);

  const clearQuizState = useCallback(() => {
    const storageKey = getStorageKey();
    if (storageKey) localStorage.removeItem(storageKey);
  }, [getStorageKey]);

  const submitAndNavigate = useCallback(async (abandon = false) => {
    if (isSubmitting) return;
    setTimerActive(false);
    clearQuizState(); 

    if (abandon) {
      navigate(quizContext.subject ? `/subjects/${quizContext.subject}` : '/subjects');
      return;
    }
    
    setIsSubmitting(true);
    let correctAnswers = 0;
    questions.forEach(q => { if(userAnswers[q.id] === q.correctOptionId) correctAnswers++ });
    const score = correctAnswers;
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    
    let resultId = null;
    if (currentUser?.token) {
        try {
            const resultPayload = {
                userId: currentUser.id, subject: quizContext.subject, topicId: quizContext.topicId, score,
                totalQuestions: questions.length, percentage, timestamp: new Date().toISOString(),
                difficulty: quizContext.difficulty, numQuestionsConfigured: quizContext.numQuestions,
                class: quizContext.quizClass, timeTaken: elapsedTime,
                questionsActuallyAttemptedIds: questions.map(q => q.id),
                userAnswersSnapshot: userAnswers, challenge_id: quizContext.challengeId || null
            };
            const response = await apiClient.post('/api/results', resultPayload, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            resultId = response.data.id;
            if (quizContext.challengeId && resultId) {
                await apiClient.put(`/api/challenges/${quizContext.challengeId}/submit`, { score, percentage, timeTaken: elapsedTime, resultId }, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            }
        } catch (err) { console.error("Failed to save result/submit challenge score", err); }
    }
    
    // --- FIX IS HERE ---
    // Generate a secure random ID for local/non-persistent results.
    // Use the saved resultId if available, otherwise generate a new random one.
    const finalResultId = resultId || generateSecureRandomId();

    navigate(`/results/${finalResultId}`, { state: { 
        ...quizContext, originalQuestionsForDisplay: questions, originalAnswersForDisplay: userAnswers,
        score, percentage, savedToHistory: !!resultId, isFirstResultView: true,
    }});

  }, [isSubmitting, userAnswers, questions, navigate, currentUser, quizContext, elapsedTime, clearQuizState]);

  useEffect(() => {
    const storageKey = getStorageKey();
    const fetchQuizData = async () => {
        setIsLoading(true);
        setError(''); setInfoMessage('');
        
        if (storageKey) {
            const savedStateJSON = localStorage.getItem(storageKey);
            if (savedStateJSON) {
                try {
                    const savedState = JSON.parse(savedStateJSON);
                    setQuestions(savedState.questions);
                    setUserAnswers(savedState.userAnswers);
                    setElapsedTime(savedState.elapsedTime);
                    setQuizContext(savedState.quizContext);
                    setTimerActive(true);
                    setIsLoading(false);
                    return;
                } catch (e) {
                    localStorage.removeItem(storageKey);
                }
            }
        }

        try {
            const quizType = quizSettings.quizType || (challengeIdFromParams ? 'challenge' : 'standard');
            let rawQuestions = [];
            let context = {};

            if (quizType === 'challenge' && challengeIdFromParams) { if (!currentUser?.token) throw new Error("You must be logged in to play a challenge."); const { challengeData, questions: fetched } = await fetchChallengeQuestions(challengeIdFromParams, currentUser.token); rawQuestions = fetched; context = { ...challengeData, topicName: challengeData.topic_name, quizClass: challengeData.quiz_class, challengeId: challengeData.id, numQuestionsConfigured: challengeData.num_questions }; } 
            else if (quizType === 'homibhabha-practice') { const { questions: fetched, info } = await fetchHomiBhabhaPracticeQuestions({ quizClassFromState: quizSettings.quizClass, difficultyLabel: quizSettings.difficulty, questionComposition: quizSettings.questionComposition, desiredTotal: quizSettings.totalQuestions }); rawQuestions = fetched; if (info) setInfoMessage(info); context = { ...quizSettings, topicId: `homibhabha-practice-${quizSettings.quizClass}-${quizSettings.difficulty}` }; } 
            else if (topicIdFromParams) { rawQuestions = await fetchTopicQuestions({ topicId: topicIdFromParams, quizClassFromState: quizSettings.quizClass, difficultyLabel: quizSettings.difficulty, numQuestionsReq: quizSettings.numQuestions, subject: quizSettings.subject }); context = { ...quizSettings, topicId: topicIdFromParams }; } 
            else { throw new Error("Quiz configuration is missing or invalid."); }
            
            const parsedQuestions = parseQuestionOptions(rawQuestions);
            setQuestions(parsedQuestions);
            setQuizContext(context);
            setUserAnswers({});
            setElapsedTime(0);

            if (rawQuestions.length > 0) {
              setTimerActive(true);
              if (storageKey) {
                const initialState = { questions: parsedQuestions, userAnswers: {}, elapsedTime: 0, quizContext: context };
                localStorage.setItem(storageKey, JSON.stringify(initialState));
              }
            }
        } catch (err) {
            setError(`Failed to load quiz: ${err.message || 'Unknown error'}`);
        }
        setIsLoading(false);
    };
    fetchQuizData();
  }, [topicIdFromParams, challengeIdFromParams, location.state, currentUser, getStorageKey]);

  useEffect(() => {
    let interval;
    if (timerActive && questions.length > 0) {
        interval = setInterval(() => {
            setElapsedTime(prev => {
                const newTime = prev + 1;
                const storageKey = getStorageKey();
                if (storageKey) {
                    try {
                        const savedState = JSON.parse(localStorage.getItem(storageKey) || '{}');
                        savedState.elapsedTime = newTime;
                        localStorage.setItem(storageKey, JSON.stringify(savedState));
                    } catch(e) { /* ignore write errors */ }
                }
                if(quizContext.timeLimit && newTime >= quizContext.timeLimit) {
                    clearInterval(interval);
                    submitAndNavigate();
                    return quizContext.timeLimit;
                }
                return newTime;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, questions.length, quizContext.timeLimit, submitAndNavigate, getStorageKey]);

  const handleOptionSelect = (questionId, selectedOptionId) => {
    const newAnswers = { ...userAnswers, [questionId]: selectedOptionId };
    setUserAnswers(newAnswers);
    const storageKey = getStorageKey();
    if(storageKey) {
        try {
            const savedState = JSON.parse(localStorage.getItem(storageKey) || '{}');
            savedState.userAnswers = newAnswers;
            localStorage.setItem(storageKey, JSON.stringify(savedState));
        } catch(e) { /* ignore write errors */ }
    }
  };

  const handleAbandonQuiz = () => {
    if (window.confirm("Are you sure you want to abandon this quiz? Your progress will be lost and you will be returned to the topics list.")) {
      submitAndNavigate(true);
    }
  }

  return {
      questions, userAnswers, isLoading, error, infoMessage, elapsedTime,
      timerActive, isSubmitting, quizContext, handleOptionSelect,
      submitAndNavigate, handleAbandonQuiz
  };
};