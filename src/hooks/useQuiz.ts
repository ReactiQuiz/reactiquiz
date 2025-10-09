// src/hooks/useQuiz.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions } from '../utils/quizUtils';
import { useNotifications } from '../contexts/NotificationsContext';
import { UseQuizReturn, Question, QuizSession } from '../types';

// The fetcher function now expects the flattened API response
const fetchQuizBySessionId = async (sessionId: string): Promise<QuizSession | null> => {
  if (!sessionId) return null;
  const { data } = await apiClient.get<QuizSession>(`/api/quizSessions/${sessionId}`);
  return data;
};

const saveQuizResult = async (resultPayload: any): Promise<any> => {
  const { data } = await apiClient.post('/api/results', resultPayload);
  return data;
};

export const useQuiz = (): UseQuizReturn => {
  const { currentUser } = useAuth();
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [quizContext, setQuizContext] = useState<{
    subject: string;
    topicName: string;
    difficulty: string;
    timeLimit: number;
    accentColor?: string | undefined;
  }>({
    subject: '',
    topicName: '',
    difficulty: '',
    timeLimit: 0
  });

  const { data: sessionData, isLoading, isError, error } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => fetchQuizBySessionId(quizId!),
    enabled: !!quizId,
    retry: false, // Don't retry if the session is invalid
  });

  const saveResultMutation = useMutation({
    mutationFn: saveQuizResult,
    onSuccess: (response: any) => {
      // Invalidate queries that show user history
      queryClient.invalidateQueries({ queryKey: ['userResults'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      // Navigate to the results page using the ID from the API response
      navigate(`/results/${response.resultId}`);
    },
    onError: (err: any) => {
      addNotification(err.response?.data?.message || 'Failed to save quiz result.', 'error');
      console.error('Error saving quiz result:', err);
    },
  });

  useEffect(() => {
    if (sessionData && sessionData.questions) {
      // 1. Call the utility function on the ENTIRE array of questions.
      const parsedQuestions: Question[] = parseQuestionOptions(sessionData.questions);
      setQuestions(parsedQuestions);
      
      // 2. Access context properties from the root of sessionData.
      setQuizContext({
        subject: sessionData.subject,
        topicName: sessionData.topicName,
        difficulty: sessionData.difficulty,
        timeLimit: sessionData.timeLimit,
        accentColor: sessionData.accentColor
      });
      
      setTimerActive(true);
    }
  }, [sessionData]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // When time runs out (timeLimit in seconds), prompt to submit or abandon
  useEffect(() => {
    if (!sessionData || !sessionData.timeLimit) return;
    const remaining = sessionData.timeLimit - elapsedTime;
    if (timerActive && remaining <= 0) {
      setTimerActive(false);
      const shouldSubmit = window.confirm('Time is up! Would you like to submit your quiz? Click OK to submit, or Cancel to abandon.');
      if (shouldSubmit) {
        submitAndNavigate();
      } else {
        handleAbandonQuiz();
      }
    }
  }, [elapsedTime, timerActive, sessionData]);

  const handleOptionSelect = (questionId: string, optionIndex: number): void => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const submitAndNavigate = (): void => {
    if (!sessionData || !currentUser) return;

    setTimerActive(false);
    
    saveResultMutation.mutate({
      quizContext: {
          topicId: sessionData.topicId,
          subject: sessionData.subject,
          difficulty: sessionData.difficulty,
          quizClass: sessionData.class, // This line is now valid
      },
      timeTaken: elapsedTime,
      questionsActuallyAttemptedIds: questions.map(q => q.id),
      userAnswersSnapshot: userAnswers,
    });
  };

  const handleAbandonQuiz = (): void => {
    if (window.confirm('Are you sure you want to abandon this quiz? Your progress will be lost.')) {
      navigate('/subjects');
    }
  };

  // Provide a more user-friendly error from the query
  const displayError = isError ? (error as any)?.response?.data?.message || (error as Error).message : null;

  return {
    questions,
    userAnswers,
    isLoading,
    error: displayError,
    infoMessage: null, // This can be used for other states if needed
    elapsedTime,
    timerActive,
    isSubmitting: saveResultMutation.isPending,
    quizContext,
    handleOptionSelect,
    submitAndNavigate,
    handleAbandonQuiz,
  };
};