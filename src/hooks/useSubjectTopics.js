// src/hooks/useSubjectTopics.js
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useMutation } from '@tanstack/react-query';
import { useSubjects } from './useSubjects'; // We will use this to get subject details
import { useTopics } from '../contexts/TopicsContext'; // <-- Import the new hook
import { useNotifications } from '../contexts/NotificationsContext'; 

const fetchQuizBySessionId = async (sessionId) => {
    if (!sessionId) return null;
    const { data } = await apiClient.get(`/api/quiz-sessions/${sessionId}`);
    return data;
};

export const useSubjectTopics = () => {
  const { subjectKey } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications(); 

  // --- START OF REFACTOR: Get data from global contexts ---
  const { subjects, isLoading: isLoadingSubjects } = useSubjects();
  const { topics: allTopics, isLoading: isLoadingTopics } = useTopics();

  // The overall loading state is a combination of both
  const isLoading = isLoadingSubjects || isLoadingTopics;

  // Derive current subject and topics for this page from the global state
  const currentSubject = useMemo(() => {
    return subjects.find(s => s.subjectKey.toLowerCase() === subjectKey.toLowerCase());
  }, [subjects, subjectKey]);

  const topicsForSubject = useMemo(() => {
    if (!currentSubject) return [];
    return allTopics.filter(topic => topic.subject_id === currentSubject.id);
  }, [allTopics, currentSubject]);
  // --- END OF REFACTOR ---

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedTopicForPdf, setSelectedTopicForPdf] = useState(null);
  
  const createSessionMutation = useMutation({
    mutationFn: (quizParams) => apiClient.post('/api/quiz-sessions', { quizParams }),
    onSuccess: (response) => {
      const { sessionId } = response.data;
      localStorage.setItem('activeQuizSessionId', sessionId);
      navigate('/quiz/loading');
    },
    onError: (err) => {
        const message = err.response?.data?.message || "Could not start the quiz. Please try again.";
        addNotification(message, 'error');
    }
  });

  const handleStartQuizWithSettings = (settings) => {
    if (selectedTopicForQuiz && currentSubject) {
      const quizParams = { 
        topicId: selectedTopicForQuiz.id,
        difficulty: settings.difficulty, 
        numQuestions: settings.numQuestions, 
        topicName: selectedTopicForQuiz.name, 
        subject: currentSubject.subjectKey, 
        quizClass: selectedTopicForQuiz.class 
      };
      createSessionMutation.mutate(quizParams);
    }
    handleCloseQuizModal();
  };

  const availableClasses = useMemo(() => {
    const allClasses = topicsForSubject.map(topic => topic.class).filter(Boolean);
    return [...new Set(allClasses)].sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b));
  }, [topicsForSubject]);

  const availableGenres = useMemo(() => {
    const allGenres = topicsForSubject.map(topic => topic.genre).filter(Boolean);
    return [...new Set(allGenres)].sort();
  }, [topicsForSubject]);

  const filteredTopics = useMemo(() => {
    return topicsForSubject.filter(topic => {
      const classMatch = !selectedClass || topic.class === selectedClass;
      const genreMatch = !selectedGenre || topic.genre === selectedGenre;
      const searchMatch = !searchTerm || 
        topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return classMatch && genreMatch && searchMatch;
    });
  }, [topicsForSubject, selectedClass, selectedGenre, searchTerm]);

  const handleOpenQuizModal = (topic) => { setSelectedTopicForQuiz(topic); setModalOpen(true); };
  const handleCloseQuizModal = () => { setModalOpen(false); setSelectedTopicForQuiz(null); };
  
  const handleStudyFlashcards = (topic) => {
    if (currentSubject) {
      navigate(`/flashcards/${topic.id}`, { 
        state: { 
          topicName: topic.name, 
          subject: currentSubject.subjectKey, 
          quizClass: topic.class 
        } 
      });
    }
  };

  const handleOpenPdfModal = (topic) => { setSelectedTopicForPdf(topic); setPdfModalOpen(true); };
  const handleClosePdfModal = () => { setSelectedTopicForPdf(null); setPdfModalOpen(false); };
  
  return {
    subjectKey,
    currentSubject,
    topics: topicsForSubject, // Pass the already filtered topics
    isLoading,
    error: null, // Error handling can be enhanced in the contexts if needed
    modalOpen,
    selectedTopicForQuiz,
    pdfModalOpen,
    selectedTopicForPdf,
    searchTerm, setSearchTerm, selectedClass, setSelectedClass,
    selectedGenre, setSelectedGenre, availableClasses, availableGenres,
    filteredTopics, handleOpenQuizModal, handleCloseQuizModal,
    handleStartQuizWithSettings, handleStudyFlashcards, handleOpenPdfModal, handleClosePdfModal,
    createSessionMutation, 
  };
};