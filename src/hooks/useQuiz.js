// src/hooks/useQuiz.js
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions, shuffleArray } from '../utils/quizUtils';

// Note: These helper functions are still useful for complex quiz types like Homi Bhabha.
// For a simple topic quiz, only fetchTopicQuestions is used.
const fetchTopicQuestions = async (settings) => {
    const { topicId, difficultyLabel, numQuestionsReq } = settings;
    const response = await apiClient.get(`/api/questions?topicId=${topicId}`);
    let questions = response.data;
    if (!Array.isArray(questions)) throw new Error("Invalid question data received.");
    if (difficultyLabel !== 'mixed') {
        let minScore = 0, maxScore = Infinity;
        if (difficultyLabel === 'easy') { minScore = 10; maxScore = 13; }
        else if (difficultyLabel === 'medium') { minScore = 14; maxScore = 17; }
        else if (difficultyLabel === 'hard') { minScore = 18; maxScore = 20; }
        const difficultyFiltered = questions.filter(q => q.difficulty >= minScore && q.difficulty <= maxScore);
        if (difficultyFiltered.length > 0) questions = difficultyFiltered;
    }
    if (questions.length === 0) throw new Error(`No questions found for topic "${topicId}" with the selected filters.`);
    return shuffleArray(questions).slice(0, numQuestionsReq);
};

export const useQuiz = () => {
  const { currentUser } = useAuth();
  const { topicId: topicIdFromParams } = useParams();
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

  // Fetches the initial set of questions for the quiz
  useEffect(() => {
    const fetchQuizData = async () => {
        setIsLoading(true);
        setError('');
        setInfoMessage('');
        try {
            let rawQuestions = [];
            let context = {};
            if (topicIdFromParams) {
                rawQuestions = await fetchTopicQuestions({
                    topicId: topicIdFromParams,
                    difficultyLabel: quizSettings.difficulty,
                    numQuestionsReq: quizSettings.numQuestions,
                });
                context = { ...quizSettings, topicId: topicIdFromParams };
            } else {
                throw new Error("Quiz configuration is missing or invalid.");
            }
            
            setQuestions(parseQuestionOptions(rawQuestions));
            setQuizContext(context);
            setUserAnswers({});
            setElapsedTime(0);
            if (rawQuestions.length > 0) {
                setTimerActive(true);
            }
        } catch (err) {
            setError(`Failed to load quiz: ${err.message || 'Unknown error'}`);
        }
        setIsLoading(false);
    };
    fetchQuizData();
  }, [topicIdFromParams, location.state]); // Dependencies for re-fetching if quiz changes

  // Handles the timer logic
  useEffect(() => {
    let interval;
    if (timerActive && questions.length > 0) {
        interval = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, questions.length]);

  // Submits the quiz to the backend and navigates to the result page
  const submitAndNavigate = useCallback(async (abandon = false) => {
    if (isSubmitting) return;
    setTimerActive(false);

    if (abandon) {
      navigate(quizContext.subject ? `/subjects/${quizContext.subject}` : '/subjects');
      return;
    }
    
    setIsSubmitting(true);
    
    const correctAnswers = questions.reduce((acc, q) => {
        return userAnswers[q.id] === q.correctOptionId ? acc + 1 : acc;
    }, 0);
    
    const score = correctAnswers;
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    
    // All quiz routes are protected, so currentUser should always exist.
    if (currentUser) {
        try {
            const resultPayload = {
                subject: quizContext.subject,
                topicId: quizContext.topicId,
                score,
                totalQuestions: questions.length,
                percentage,
                timestamp: new Date().toISOString(),
                difficulty: quizContext.difficulty,
                timeTaken: elapsedTime,
                questionsActuallyAttemptedIds: questions.map(q => q.id),
                userAnswersSnapshot: userAnswers,
            };

            // The axios interceptor automatically adds the auth token
            const response = await apiClient.post('/api/results', resultPayload);
            
            const realResultId = response.data.id;
            if (!realResultId) {
                throw new Error("API did not return a valid result ID after saving.");
            }

            // On success, navigate to the results page using the REAL ID from the database
            navigate(`/results/${realResultId}`);

        } catch (err) {
            console.error("Failed to save result:", err);
            // If saving fails, show an error on the quiz page itself and DO NOT navigate.
            setError("There was a problem saving your quiz result. Please try submitting again.");
            setIsSubmitting(false); // Allow the user to retry
        }
    } else {
        // This is a fallback case, shouldn't be reached if ProtectedRoute is working
        setError("You must be logged in to save quiz results.");
        setIsSubmitting(false);
    }
  }, [isSubmitting, userAnswers, questions, navigate, currentUser, quizContext, elapsedTime]);

  // Handles selecting an answer option
  const handleOptionSelect = (questionId, selectedOptionId) => {
    setUserAnswers(prevAnswers => ({
        ...prevAnswers,
        [questionId]: selectedOptionId,
    }));
  };

  // Handles abandoning the quiz
  const handleAbandonQuiz = () => {
    if (window.confirm("Are you sure you want to abandon this quiz? Your progress will be lost.")) {
      submitAndNavigate(true); // Call submitAndNavigate with abandon flag
    }
  };

  return {
      questions,
      userAnswers,
      isLoading,
      error,
      infoMessage,
      elapsedTime,
      timerActive,
      isSubmitting,
      quizContext,
      handleOptionSelect,
      submitAndNavigate,
      handleAbandonQuiz
  };
};