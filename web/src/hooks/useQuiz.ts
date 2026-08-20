// src/hooks/useQuiz.ts
/**
 * Quiz Hook
 * 
 * This hook manages quiz state and functionality during quiz taking.
 * It handles fetching quiz sessions, managing user answers, tracking time,
 * and submitting quiz results. Provides comprehensive quiz-taking experience
 * with timer, answer tracking, and automatic submission on time limit.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions } from '../utils/quizUtils';
import { useNotifications } from '../contexts/NotificationsContext';
import { UseQuizReturn, Question, QuizSession } from '../types';

/**
 * Quiz Progress Persistence
 *
 * Answers and the quiz start time are persisted to sessionStorage, keyed by
 * quiz session id. Previously these lived only in component state, so a
 * refresh (accidental, or a mobile browser backgrounding/discarding the tab)
 * silently lost every answer and the elapsed time on a timed quiz.
 *
 * Storing a start *timestamp* rather than a tick counter also fixes timer
 * drift: a plain `setInterval` counter undercounts time the tab spent
 * backgrounded (browsers throttle or pause timers in inactive tabs), while
 * `Date.now() - startedAt` is correct regardless of how long the tab was away.
 */
interface QuizProgress {
  userAnswers: Record<string, number>;
  startedAt: number; // epoch ms
}

const progressKey = (sessionId: string) => `quiz-progress-${sessionId}`;

const loadProgress = (sessionId: string): QuizProgress | null => {
  try {
    const raw = sessionStorage.getItem(progressKey(sessionId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveProgress = (sessionId: string, progress: QuizProgress): void => {
  try {
    sessionStorage.setItem(progressKey(sessionId), JSON.stringify(progress));
  } catch {
    // sessionStorage unavailable (private browsing, quota) — progress just
    // won't survive a refresh; the quiz itself still works.
  }
};

const clearProgress = (sessionId: string): void => {
  try {
    sessionStorage.removeItem(progressKey(sessionId));
  } catch { /* no-op */ }
};

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
  // Epoch ms the quiz was started at — elapsed time is derived from this
  // rather than an incrementing counter (see loadProgress/saveProgress above).
  const startedAtRef = useRef<number | null>(null);
  // State for quiz context (subject, topic, time limit, colors)
  const [quizContext, setQuizContext] = useState<{
    subject: string; // Subject identifier
    topicName: string; // Display name of the topic
    timeLimit: number; // Time limit in seconds
    accentColor?: string | undefined; // UI accent color
  }>({
    subject: '',
    topicName: '',
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
      // Quiz is scored and saved — the in-progress snapshot is no longer needed.
      if (quizId) clearProgress(quizId);
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

      // 2. Set quiz context from session data (subject, topic, time limit, colors)
      setQuizContext({
        subject: sessionData.subject,
        topicName: sessionData.topicName,
        timeLimit: sessionData.timeLimit,
        accentColor: sessionData.accentColor
      });

      // 3. Restore answers/start-time from a previous attempt at this same
      // session (e.g. the user refreshed mid-quiz), or start fresh.
      const existing = quizId ? loadProgress(quizId) : null;
      if (existing) {
        setUserAnswers(existing.userAnswers);
        startedAtRef.current = existing.startedAt;
        setElapsedTime(Math.floor((Date.now() - existing.startedAt) / 1000));
      } else if (quizId) {
        const startedAt = Date.now();
        startedAtRef.current = startedAt;
        saveProgress(quizId, { userAnswers: {}, startedAt });
      }

      // Activate timer once quiz data is loaded
      setTimerActive(true);
    }
  }, [sessionData, quizId]);

  /**
   * Timer Effect
   *
   * Ticks elapsed time once per second while active, derived from the fixed
   * start timestamp rather than incrementing a counter — see startedAtRef's
   * comment for why (backgrounded-tab drift).
   */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        if (startedAtRef.current != null) {
          setElapsedTime(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }
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
      if (quizId) clearProgress(quizId);
      // Navigate back to subjects page
      navigate('/subjects');
    }
  }, [navigate, quizId]);

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
    setUserAnswers(prev => {
      const next = { ...prev, [questionId]: optionIndex };
      if (quizId && startedAtRef.current != null) {
        saveProgress(quizId, { userAnswers: next, startedAt: startedAtRef.current });
      }
      return next;
    });
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