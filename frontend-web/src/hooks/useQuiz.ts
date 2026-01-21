// src/hooks/useQuiz.ts
/**
 * Quiz Hook
 * 
 * This hook manages quiz state and functionality during quiz taking.
 * It handles fetching quiz sessions, managing user answers, tracking time,
 * and submitting quiz results. Provides comprehensive quiz-taking experience
 * with timer, answer tracking, and automatic submission on time limit.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions } from '../utils/quizUtils';
import { useNotifications } from '../contexts/NotificationsContext';
import { UseQuizReturn, Question, QuizSession } from '../types';

/**
 * Fetch Quiz By Session ID
 * 
 * Fetches a quiz session from the API using the session ID.
 * The session contains all quiz data including questions and context.
 * 
 * @param {string} sessionId - The quiz session identifier
 * @returns {Promise<QuizSession | null>} Promise that resolves to quiz session data or null
 */
const fetchQuizBySessionId = async (sessionId: string): Promise<QuizSession | null> => {
  // Early return if sessionId is not provided
  if (!sessionId) return null;
  // Fetch quiz session from API
  const { data } = await apiClient.get<QuizSession>(`/api/quizSessions/${sessionId}`);
  return data;
};

/**
 * Save Quiz Result
 * 
 * Saves the user's quiz result to the API. This includes all answers,
 * time taken, and quiz context information.
 * 
 * @param {any} resultPayload - The quiz result data to save
 * @returns {Promise<any>} Promise that resolves to the saved result data
 */
const saveQuizResult = async (resultPayload: any): Promise<any> => {
  // Save quiz result to API
  const { data } = await apiClient.post('/api/results', resultPayload);
  return data;
};

/**
 * useQuiz Hook
 * 
 * Custom hook that manages the entire quiz-taking experience. Handles:
 * - Fetching quiz session data
 * - Managing user answers
 * - Tracking elapsed time with timer
 * - Auto-submission on time limit
 * - Saving quiz results
 * - Navigation after submission
 * 
 * @returns {UseQuizReturn} Quiz state, questions, answers, timer, and handlers
 */
export const useQuiz = (): UseQuizReturn => {
  // Authentication context for current user
  const { currentUser } = useAuth();
  // Get quizId from URL parameters
  const { quizId } = useParams<{ quizId: string }>();
  // Navigation hook for routing
  const navigate = useNavigate();
  // React Query client for invalidating queries
  const queryClient = useQueryClient();
  // Notification context for displaying errors
  const { addNotification } = useNotifications();

  // State for quiz questions array
  const [questions, setQuestions] = useState<Question[]>([]);
  // State for user's answers (questionId -> optionIndex mapping)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  // State for elapsed time in seconds
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  // State for timer active status
  const [timerActive, setTimerActive] = useState<boolean>(false);
  // State for quiz context (subject, topic, difficulty, time limit, colors)
  const [quizContext, setQuizContext] = useState<{
    subject: string; // Subject identifier
    topicName: string; // Display name of the topic
    difficulty: string; // Difficulty level
    timeLimit: number; // Time limit in seconds
    accentColor?: string | undefined; // UI accent color
  }>({
    subject: '',
    topicName: '',
    difficulty: '',
    timeLimit: 0
  });

  /**
   * Fetch Quiz Session Query
   * 
   * Uses React Query to fetch the quiz session data. The query is only
   * enabled when quizId is available. Retries are disabled to avoid
   * unnecessary requests for invalid sessions.
   */
  const { data: sessionData, isLoading, isError, error } = useQuery({
    queryKey: ['quiz', quizId], // Cache key includes quizId
    queryFn: () => fetchQuizBySessionId(quizId!), // Fetch function
    enabled: !!quizId, // Only fetch if quizId exists
    retry: false, // Don't retry if the session is invalid
  });

  /**
   * Save Result Mutation
   * 
   * React Query mutation for saving quiz results. On success, invalidates
   * related queries to refresh user history and navigates to results page.
   */
  const saveResultMutation = useMutation({
    mutationFn: saveQuizResult, // Mutation function
    onSuccess: (response: any) => {
      // Invalidate queries that show user history to refresh data
      queryClient.invalidateQueries({ queryKey: ['userResults'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      // Navigate to the results page using the ID from the API response
      navigate(`/results/${response.resultId}`);
    },
    onError: (err: any) => {
      // Extract error message or use default
      addNotification(err.response?.data?.message || 'Failed to save quiz result.', 'error');
      console.error('Error saving quiz result:', err);
    },
  });

  /**
   * Initialize Quiz Effect
   * 
   * Processes quiz session data when it's loaded. Parses questions
   * and sets up quiz context. Activates the timer once quiz is ready.
   */
  useEffect(() => {
    if (sessionData && sessionData.questions) {
      // 1. Parse question options from JSON strings to objects for all questions
      const parsedQuestions: Question[] = parseQuestionOptions(sessionData.questions);
      setQuestions(parsedQuestions);
      
      // 2. Set quiz context from session data (subject, topic, difficulty, time limit, colors)
      setQuizContext({
        subject: sessionData.subject,
        topicName: sessionData.topicName,
        difficulty: sessionData.difficulty,
        timeLimit: sessionData.timeLimit,
        accentColor: sessionData.accentColor
      });
      
      // Activate timer once quiz data is loaded
      setTimerActive(true);
    }
  }, [sessionData]);

  /**
   * Timer Effect
   * 
   * Manages the quiz timer. Increments elapsed time every second
   * when the timer is active. Cleans up interval on unmount or deactivation.
   */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      // Create interval that increments elapsed time every second
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    // Cleanup: clear interval on unmount or when timer stops
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  /**
   * Submit And Navigate
   * 
   * Submits the quiz and navigates to the results page. Stops the timer,
   * saves the quiz result with all answers and context, then navigates
   * to the results page on success.
   * 
   * This function is memoized with useCallback to maintain referential stability.
   */
  const submitAndNavigate = useCallback((): void => {
    // Don't proceed if session data or user is not available
    if (!sessionData || !currentUser) return;

    // Stop the timer
    setTimerActive(false);
    // Save quiz result with all necessary data
    saveResultMutation.mutate({
      quizContext: {
        topicId: sessionData.topicId,
        subject: sessionData.subject,
        difficulty: sessionData.difficulty,
        quizClass: sessionData.class,
      },
      timeTaken: elapsedTime, // Total time taken in seconds
      questionsActuallyAttemptedIds: questions.map(q => q.id), // IDs of all questions attempted
      userAnswersSnapshot: userAnswers, // User's answers (questionId -> optionIndex)
    });
  }, [sessionData, currentUser, elapsedTime, questions, userAnswers, saveResultMutation]);

  /**
   * Handle Abandon Quiz
   * 
   * Abandons the quiz with user confirmation. Navigates away from quiz
   * page if user confirms, losing all progress.
   * 
   * This function is memoized with useCallback to maintain referential stability.
   */
  const handleAbandonQuiz = useCallback((): void => {
    // Confirm with user before abandoning
    if (window.confirm('Are you sure you want to abandon this quiz? Your progress will be lost.')) {
      // Navigate back to subjects page
      navigate('/subjects');
    }
  }, [navigate]);

  /**
   * Time Limit Effect
   * 
   * Monitors elapsed time and automatically prompts user to submit or abandon
   * when the time limit is reached. Stops the timer and gives user choice.
   */
  useEffect(() => {
    // Don't proceed if no session data or time limit
    if (!sessionData || !sessionData.timeLimit) return;
    
    // Calculate remaining time
    const remaining = sessionData.timeLimit - elapsedTime;
    
    // When time runs out (timeLimit in seconds)
    if (timerActive && remaining <= 0) {
      // Stop the timer
      setTimerActive(false);
      // Prompt user to submit or abandon
      const shouldSubmit = window.confirm('Time is up! Would you like to submit your quiz? Click OK to submit, or Cancel to abandon.');
      if (shouldSubmit) {
        // Submit quiz and navigate to results
        submitAndNavigate();
      } else {
        // Abandon quiz and navigate away
        handleAbandonQuiz();
      }
    }
  }, [elapsedTime, timerActive, sessionData, submitAndNavigate, handleAbandonQuiz]);

  /**
   * Handle Option Select
   * 
   * Handles user selecting an answer option for a question.
   * Updates the userAnswers state with the selected option index.
   * 
   * @param {string} questionId - The ID of the question being answered
   * @param {number} optionIndex - The index of the selected option (0-based)
   */
  const handleOptionSelect = (questionId: string, optionIndex: number): void => {
    // Update user answers with new selection
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex // Map questionId to selected option index
    }));
  };

  /**
   * Display Error
   * 
   * Provides a user-friendly error message from the query error.
   * Extracts message from API response or uses error message.
   */
  const displayError = isError ? (error as any)?.response?.data?.message || (error as Error).message : null;

  return {
    questions, // Array of quiz questions
    userAnswers, // User's answers (questionId -> optionIndex mapping)
    isLoading, // Loading state from query
    error: displayError, // Error message or null
    infoMessage: null, // This can be used for other states if needed
    elapsedTime, // Time elapsed in seconds
    timerActive, // Whether timer is currently running
    isSubmitting: saveResultMutation.isPending, // Whether result is being saved
    quizContext, // Quiz context (subject, topic, difficulty, time limit, colors)
    handleOptionSelect, // Handler for selecting an answer option
    submitAndNavigate, // Handler for submitting quiz and navigating to results
    handleAbandonQuiz, // Handler for abandoning quiz
  };
};