// src/hooks/useQuiz.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions } from '../utils/quizUtils';
import { useNotifications } from '../contexts/NotificationsContext';
import { UseQuizReturn, Question, QuizSession } from '../types';

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
  });

  const saveResultMutation = useMutation({
    mutationFn: saveQuizResult,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['userResults'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(`/results/${result.id}`);
    },
    onError: (error: any) => {
      addNotification('Failed to save quiz result', 'error');
      console.error('Error saving quiz result:', error);
    },
  });

  useEffect(() => {
    if (sessionData) {
      const parsedQuestions: Question[] = sessionData.questions.map(q => ({
        ...q,
        options: parseQuestionOptions(q.options)
      }));
      setQuestions(parsedQuestions);
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
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

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
      sessionId: sessionData.id,
      userAnswers,
      timeSpent: elapsedTime
    });
  };

  const handleAbandonQuiz = (): void => {
    if (window.confirm('Are you sure you want to abandon this quiz? Your progress will be lost.')) {
      navigate('/subjects');
    }
  };

  return {
    questions,
    userAnswers,
    isLoading,
    error: isError ? (error as Error).message : null,
    infoMessage: null,
    elapsedTime,
    timerActive,
    isSubmitting: saveResultMutation.isPending,
    quizContext,
    handleOptionSelect,
    submitAndNavigate,
    handleAbandonQuiz,
  };
};
