// src/hooks/useSubjectTopics.js
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// This is the fetcher function that will be used by our pre-fetch logic.
// It retrieves the quiz data for a given session ID.
const fetchQuizBySessionId = async (sessionId) => {
    if (!sessionId) return null;
    const { data } = await apiClient.get(`/api/quiz-sessions/${sessionId}`);
    return data;
};

export const useSubjectTopics = () => {
  const { subjectKey } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state for UI controls (filters, modals, etc.)
  const [currentSubject, setCurrentSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedTopicForPdf, setSelectedTopicForPdf] = useState(null);
  
  // useQuery to fetch the list of topics for the current subject page.
  const { isLoading, error } = useQuery({
      queryKey: ['topicsForSubject', subjectKey],
      queryFn: async () => {
        // Fetch subjects and topics in parallel for efficiency
        const [subjectsResponse, topicsResponse] = await Promise.all([
            apiClient.get('/api/subjects'),
            apiClient.get(`/api/topics/${subjectKey}`)
        ]);
        const foundSubject = subjectsResponse.data.find(s => s.subjectKey.toLowerCase() === subjectKey.toLowerCase());
        if (!foundSubject) throw new Error(`Subject '${subjectKey}' not found.`);
        
        // Set local state needed by the component
        setCurrentSubject(foundSubject);
        setTopics(topicsResponse.data);
        return topicsResponse.data; // Return data for TanStack Query to cache
      },
      enabled: !!subjectKey // Only run this query if a subjectKey is present in the URL
  });

  // useMutation to handle the entire "Start Quiz" process atomically.
  const createSessionMutation = useMutation({
    mutationFn: (quizParams) => apiClient.post('/api/quiz-sessions', { quizParams }),
    onSuccess: async (response) => {
      const { sessionId } = response.data;
      
      // PRE-FETCH STEP: Fetch the quiz data immediately and seed the cache.
      // The user won't see a loading screen on the quiz page.
      await queryClient.prefetchQuery({
          queryKey: ['quiz', sessionId],
          queryFn: () => fetchQuizBySessionId(sessionId),
      });

      // After data is in the cache, navigate to the quiz page.
      navigate(`/quiz/${sessionId}`);
    },
    onError: (err) => {
        console.error("Failed to create or pre-fetch quiz session", err);
        alert(err.response?.data?.message || "Could not start the quiz. Please try again.");
    }
  });

  // Handler called by the QuizSettingsModal
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
      // This single call triggers the entire mutation flow (create, pre-fetch, navigate)
      createSessionMutation.mutate(quizParams);
    }
    // Close the modal immediately; the mutation's pending state will handle UI feedback.
    handleCloseQuizModal();
  };

  // Memoized filtering logic (unchanged)
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

  // Other UI handlers (unchanged)
  const handleOpenQuizModal = (topic) => { setSelectedTopicForQuiz(topic); setModalOpen(true); };
  const handleCloseQuizModal = () => { setModalOpen(false); setSelectedTopicForQuiz(null); };
  
  const handleStudyFlashcards = (topic) => {
    if (currentSubject) {
      navigate(`/flashcards/${topic.id}`, { 
        state: { 
          topicName: topic.name, 
          accentColor: currentSubject.accentColor, 
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
    topics,
    isLoading,
    error: error ? error.message : null,
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
    // Pass the mutation object so the page can access its loading state
    createSessionMutation, 
  };
};