// src/hooks/useSubjectTopics.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';

/**
 * A custom hook to manage all state and logic for the SubjectTopicsPage.
 * It handles fetching data for a specific subject and its topics,
 * and manages all filtering and modal interactions.
 */
export const useSubjectTopics = () => {
  const { subjectKey } = useParams();
  const navigate = useNavigate();

  // --- State for Data Fetching ---
  const [currentSubject, setCurrentSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- State for Filtering ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  // --- State for Modals ---
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState(null);

  // --- Data Fetching Logic ---
  const fetchSubjectData = useCallback(async () => {
    if (!subjectKey) {
      setError('Subject key is missing from URL.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    // Reset filters when subject changes
    setSearchTerm('');
    setSelectedClass('');
    setSelectedGenre('');

    try {
      // Fetch both subjects and topics concurrently
      const [subjectsResponse, topicsResponse] = await Promise.all([
        apiClient.get('/api/subjects'),
        apiClient.get(`/api/topics/${subjectKey}`)
      ]);

      if (!Array.isArray(subjectsResponse.data)) throw new Error('Invalid subjects data format.');
      const foundSubject = subjectsResponse.data.find(s => s.subjectKey.toLowerCase() === subjectKey.toLowerCase());
      if (!foundSubject) throw new Error(`Subject '${subjectKey}' not found.`);
      
      if (!Array.isArray(topicsResponse.data)) throw new Error(`Invalid topic data received for ${foundSubject.name}.`);

      setCurrentSubject(foundSubject);
      setTopics(topicsResponse.data);
    } catch (err) {
      console.error(`Error fetching data for subject ${subjectKey}:`, err);
      setError(`Failed to load data: ${err.message}`);
      setCurrentSubject(null);
      setTopics([]);
    } finally {
      setIsLoading(false);
    }
  }, [subjectKey]);

  useEffect(() => {
    fetchSubjectData();
  }, [fetchSubjectData]);


  // --- Memoized Derived State for Filtering ---
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


  // --- Event Handlers ---
  const handleOpenQuizModal = (topic) => { setSelectedTopicForQuiz(topic); setModalOpen(true); };
  const handleCloseQuizModal = () => { setModalOpen(false); setSelectedTopicForQuiz(null); };
  
  const handleStartQuizWithSettings = (settings) => {
    if (selectedTopicForQuiz && currentSubject) {
      navigate(`/quiz/${selectedTopicForQuiz.id}`, { 
        state: { 
          difficulty: settings.difficulty, 
          numQuestions: settings.numQuestions, 
          topicName: selectedTopicForQuiz.name, 
          accentColor: currentSubject.accentColor, 
          subject: currentSubject.subjectKey, 
          quizClass: selectedTopicForQuiz.class 
        } 
      });
    }
    handleCloseQuizModal();
  };

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

  return {
    subjectKey,
    currentSubject,
    topics,
    isLoading,
    error,
    modalOpen,
    selectedTopicForQuiz,
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
    handleStudyFlashcards
  };
};