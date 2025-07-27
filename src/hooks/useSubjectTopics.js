// src/hooks/useSubjectTopics.js
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useQuery, useMutation } from '@tanstack/react-query';

export const useSubjectTopics = () => {
  const { subjectKey } = useParams();
  const navigate = useNavigate();

  const [currentSubject, setCurrentSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedTopicForPdf, setSelectedTopicForPdf] = useState(null);
  
  const { isLoading, error } = useQuery({
      queryKey: ['topicsForSubject', subjectKey],
      queryFn: async () => {
        const [subjectsResponse, topicsResponse] = await Promise.all([
            apiClient.get('/api/subjects'),
            apiClient.get(`/api/topics/${subjectKey}`)
        ]);
        const foundSubject = subjectsResponse.data.find(s => s.subjectKey.toLowerCase() === subjectKey.toLowerCase());
        if (!foundSubject) throw new Error(`Subject '${subjectKey}' not found.`);
        setCurrentSubject(foundSubject);
        setTopics(topicsResponse.data);
        return topicsResponse.data;
      },
      enabled: !!subjectKey
  });

  // --- START OF FIX: This mutation now saves to localStorage and navigates to the loading page ---
  const createSessionMutation = useMutation({
    mutationFn: (quizParams) => apiClient.post('/api/quiz-sessions', { quizParams }),
    onSuccess: (response) => {
      const { sessionId } = response.data;
      localStorage.setItem('activeQuizSessionId', sessionId);
      navigate('/quiz/loading');
    },
    onError: (err) => {
        console.error("Failed to create quiz session", err);
        alert(err.response?.data?.message || "Could not start the quiz. Please try again.");
    }
  });

  const handleStartQuizWithSettings = (settings) => {
    if (selectedTopicForQuiz && currentSubject) {
      const quizParams = { 
        topicId: selectedTopicForQuiz.id,
        difficulty: settings.difficulty, 
        numQuestions: settings.numQuestions, 
        topicName: selectedTopicForQuiz.name, 
        accentColor: currentSubject.accentColor, 
        subject: currentSubject.subjectKey, 
        quizClass: selectedTopicForQuiz.class 
      };
      createSessionMutation.mutate(quizParams);
    }
    handleCloseQuizModal();
  };
  // --- END OF FIX ---

  // ... [The rest of the hook is unchanged] ...
  const availableClasses = useMemo(() => {
    const allClasses = topics.map(topic => topic.class).filter(Boolean);
    return [...new Set(allClasses)].sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b));
  }, [topics]);
  const availableGenres = useMemo(() => {
    const allGenres = topics.map(topic => topic.genre).filter(Boolean);
    return [...new Set(allGenres)].sort();
  }, [topics]);
  const filteredTopics = useMemo(() => {
    return topics.filter(topic => {
      const classMatch = !selectedClass || topic.class === selectedClass;
      const genreMatch = !selectedGenre || topic.genre === selectedGenre;
      const searchMatch = !searchTerm || 
        topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return classMatch && genreMatch && searchMatch;
    });
  }, [topics, selectedClass, selectedGenre, searchTerm]);
  const handleOpenQuizModal = (topic) => { setSelectedTopicForQuiz(topic); setModalOpen(true); };
  const handleCloseQuizModal = () => { setModalOpen(false); setSelectedTopicForQuiz(null); };
  const handleStudyFlashcards = (topic) => {
    if (currentSubject) {
      navigate(`/flashcards/${topic.id}`, { state: { topicName: topic.name, accentColor: currentSubject.accentColor, subject: currentSubject.subjectKey, quizClass: topic.class } });
    }
  };
  const handleOpenPdfModal = (topic) => { setSelectedTopicForPdf(topic); setPdfModalOpen(true); };
  const handleClosePdfModal = () => { setSelectedTopicForPdf(null); setPdfModalOpen(false); };
  
  return {
    subjectKey, currentSubject, topics, isLoading, error: error ? error.message : null,
    modalOpen, selectedTopicForQuiz, pdfModalOpen, selectedTopicForPdf,
    searchTerm, setSearchTerm, selectedClass, setSelectedClass,
    selectedGenre, setSelectedGenre, availableClasses, availableGenres,
    filteredTopics, handleOpenQuizModal, handleCloseQuizModal,
    handleStartQuizWithSettings, handleStudyFlashcards, handleOpenPdfModal, handleClosePdfModal,
    createSessionMutation, 
  };
};