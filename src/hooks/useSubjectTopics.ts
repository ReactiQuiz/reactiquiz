// src/hooks/useSubjectTopics.ts
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useMutation } from '@tanstack/react-query';
import { useSubjects } from './useSubjects';
import { useTopics } from '../contexts/TopicsContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../contexts/AuthContext';
import { UseSubjectTopicsReturn, Subject, Topic } from '../types';

export const useSubjectTopics = (): UseSubjectTopicsReturn => {
  const { subjectKey } = useParams<{ subjectKey: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { currentUser } = useAuth();

  const { subjects, isLoading: isLoadingSubjects } = useSubjects();
  const { topics: allTopics, isLoading: isLoadingTopics } = useTopics();

  const isLoading = isLoadingSubjects || isLoadingTopics;

  const currentSubject = useMemo((): Subject | null => {
    if (!subjectKey) return null;
    return subjects.find(s => s.subjectKey.toLowerCase() === subjectKey.toLowerCase()) || null;
  }, [subjects, subjectKey]);

  const topicsForSubject = useMemo((): Topic[] => {
    if (!currentSubject) return [];
    return allTopics.filter(topic => topic.subject_id === currentSubject.id);
  }, [allTopics, currentSubject]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState<Topic | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState<boolean>(false);
  const [selectedTopicForPdf, setSelectedTopicForPdf] = useState<Topic | null>(null);

  const availableClasses = useMemo(() => {
    const classes = Array.from(new Set(topicsForSubject.map(topic => topic.class)));
    return classes.sort();
  }, [topicsForSubject]);

  const availableGenres = useMemo(() => {
    const genres = Array.from(new Set(topicsForSubject.map(topic => topic.genre)));
    return genres.sort();
  }, [topicsForSubject]);

  const filteredTopics = useMemo(() => {
    return topicsForSubject.filter(topic => {
      const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = !selectedClass || topic.class === selectedClass;
      const matchesGenre = !selectedGenre || topic.genre === selectedGenre;
      return matchesSearch && matchesClass && matchesGenre;
    });
  }, [topicsForSubject, searchTerm, selectedClass, selectedGenre]);

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const { data } = await apiClient.post('/api/quizSessions', sessionData);
      return data;
    },
    onSuccess: (session) => {
      if (session?.sessionId) {
        localStorage.setItem('activeQuizSessionId', session.sessionId);
        navigate(`/quiz/${session.sessionId}`);
      } else {
        addNotification('Failed to create quiz session: Session ID is missing', 'error');
        console.error('Error creating quiz session: Session ID is undefined in API response', session);
      }
    },
    onError: (error: any) => {
      addNotification('Failed to create quiz session', 'error');
      console.error('Error creating quiz session:', error);
    },
  });

  const handleOpenQuizModal = (topic: Topic): void => {
    setSelectedTopicForQuiz(topic);
    setModalOpen(true);
  };

  const handleCloseQuizModal = (): void => {
    setModalOpen(false);
    setSelectedTopicForQuiz(null);
  };

  const handleStartQuizWithSettings = (settings: any): void => {
    if (!selectedTopicForQuiz || !currentUser) return;

    const sessionData = {
      topicId: selectedTopicForQuiz.id,
      difficulty: settings.difficulty,
      // Convert minutes (from UI) to seconds for the backend/session usage
      timeLimit: Number(settings.timeLimit) * 60,
      numQuestions: settings.numQuestions || 10, // Default to 10 questions
      subject: currentSubject?.subjectKey,
      topicName: selectedTopicForQuiz.name,
      accentColor: currentSubject?.accentColorDark
    };

    createSessionMutation.mutate(sessionData);
    handleCloseQuizModal();
  };

  const handleStudyFlashcards = (topic: Topic): void => {
    navigate(`/flashcards/${topic.id}`);
  };

  const handleOpenPdfModal = (topic: Topic): void => {
    setSelectedTopicForPdf(topic);
    setPdfModalOpen(true);
  };

  const handleClosePdfModal = (): void => {
    setPdfModalOpen(false);
    setSelectedTopicForPdf(null);
  };

  const handleStartTheoryPaper = (topic: Topic): void => {
    navigate(`/subjective/${topic.id}`);
  };

  const error = !currentSubject && !isLoading ? 'Subject not found' : null;

  return {
    subjectKey: subjectKey || '',
    currentSubject,
    isLoading,
    error,
    modalOpen,
    selectedTopicForQuiz,
    pdfModalOpen,
    selectedTopicForPdf,
    searchTerm,
    setSearchTerm,
    selectedClass,
    setSelectedClass,
    selectedGenre,
    setSelectedGenre,
    availableClasses,
    availableGenres,
    filteredTopics,
    handleOpenQuizModal,
    handleCloseQuizModal,
    handleStartQuizWithSettings,
    handleStudyFlashcards,
    handleOpenPdfModal,
    handleClosePdfModal,
    createSessionMutation,
    handleStartTheoryPaper,
  };
};
