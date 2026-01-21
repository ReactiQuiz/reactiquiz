// src/hooks/useSubjectTopics.ts
/**
 * Subject Topics Hook
 * 
 * This hook manages topics for a specific subject, including filtering,
 * searching, and quiz session creation. It provides functionality for
 * viewing topics within a subject and starting quizzes from those topics.
 */
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useMutation } from '@tanstack/react-query';
import { useSubjects } from './useSubjects';
import { useTopics } from '../contexts/TopicsContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../contexts/AuthContext';
import { UseSubjectTopicsReturn, Subject, Topic } from '../types';

/**
 * useSubjectTopics Hook
 * 
 * Custom hook that manages topics for a specific subject. Provides:
 * - Finding current subject from URL parameter
 * - Filtering topics by search term, class, and genre
 * - Creating quiz sessions from topics
 * - Navigation to flashcards
 * - Modal management for quiz settings
 * 
 * @returns {UseSubjectTopicsReturn} Subject data, topics, filters, handlers, and quiz session creation
 */
export const useSubjectTopics = (): UseSubjectTopicsReturn => {
  // Get subjectKey from URL parameters
  const { subjectKey } = useParams<{ subjectKey: string }>();
  // Navigation hook for routing
  const navigate = useNavigate();
  // Notification context for displaying errors
  const { addNotification } = useNotifications();
  // Authentication context for current user
  const { currentUser } = useAuth();

  // Fetch subjects data
  const { subjects, isLoading: isLoadingSubjects } = useSubjects();
  // Fetch topics data from context
  const { topics: allTopics, isLoading: isLoadingTopics } = useTopics();

  // Combined loading state (true if either subjects or topics are loading)
  const isLoading = isLoadingSubjects || isLoadingTopics;

  /**
   * Current Subject
   * 
   * Finds the current subject based on subjectKey from URL.
   * Memoized to recalculate only when subjects or subjectKey changes.
   */
  const currentSubject = useMemo((): Subject | null => {
    // Return null if no subjectKey
    if (!subjectKey) return null;
    // Find subject by matching subjectKey (case-insensitive)
    return subjects.find(s => s.subjectKey.toLowerCase() === subjectKey.toLowerCase()) || null;
  }, [subjects, subjectKey]);

  /**
   * Topics For Subject
   * 
   * Filters all topics to only include topics belonging to the current subject.
   * Memoized to recalculate only when topics or current subject changes.
   */
  const topicsForSubject = useMemo((): Topic[] => {
    // Return empty array if no current subject
    if (!currentSubject) return [];
    // Filter topics by matching subject_id
    return allTopics.filter(topic => topic.subject_id === currentSubject.id);
  }, [allTopics, currentSubject]);

  // State for search term (filtering topics by name)
  const [searchTerm, setSearchTerm] = useState<string>('');
  // State for selected class filter
  const [selectedClass, setSelectedClass] = useState<string>('');
  // State for selected genre filter
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  // State for quiz settings modal visibility
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  // State for topic selected for quiz creation
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState<Topic | null>(null);

  /**
   * Available Classes
   * 
   * Extracts unique class values from topics for filter dropdowns.
   * Memoized to recalculate only when topics change.
   */
  const availableClasses = useMemo(() => {
    // Extract unique class values from topics
    const classes = Array.from(new Set(topicsForSubject.map(topic => topic.class)));
    // Sort alphabetically
    return classes.sort();
  }, [topicsForSubject]);

  /**
   * Available Genres
   * 
   * Extracts unique genre values from topics for filter dropdowns.
   * Memoized to recalculate only when topics change.
   */
  const availableGenres = useMemo(() => {
    // Extract unique genre values from topics
    const genres = Array.from(new Set(topicsForSubject.map(topic => topic.genre)));
    // Sort alphabetically
    return genres.sort();
  }, [topicsForSubject]);

  /**
   * Filtered Topics
   * 
   * Filters topics based on search term, class, and genre filters.
   * Topics must match all active filters.
   * Memoized to recalculate only when topics or filters change.
   */
  const filteredTopics = useMemo(() => {
    return topicsForSubject.filter(topic => {
      // Check if topic matches search term (name, case-insensitive)
      const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase());
      // Check if topic matches class filter (or no filter selected)
      const matchesClass = !selectedClass || topic.class === selectedClass;
      // Check if topic matches genre filter (or no filter selected)
      const matchesGenre = !selectedGenre || topic.genre === selectedGenre;
      // Topic must match all active filters
      return matchesSearch && matchesClass && matchesGenre;
    });
  }, [topicsForSubject, searchTerm, selectedClass, selectedGenre]);

  /**
   * Create Quiz Session Mutation
   * 
   * React Query mutation for creating a quiz session. On success,
   * stores the session ID and navigates to the quiz page.
   */
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      // Create quiz session via API
      const { data } = await apiClient.post('/api/quizSessions', sessionData);
      return data;
    },
    onSuccess: (session) => {
      // Check if session ID exists
      if (session?.sessionId) {
        // Store session ID in localStorage for quiz page access
        localStorage.setItem('activeQuizSessionId', session.sessionId);
        // Navigate to quiz page with session ID
        navigate(`/quiz/${session.sessionId}`);
      } else {
        // Show error if session ID is missing
        addNotification('Failed to create quiz session: Session ID is missing', 'error');
        console.error('Error creating quiz session: Session ID is undefined in API response', session);
      }
    },
    onError: (error: any) => {
      // Show error notification
      addNotification('Failed to create quiz session', 'error');
      console.error('Error creating quiz session:', error);
    },
  });

  /**
   * Handle Open Quiz Modal
   * 
   * Opens the quiz settings modal for a specific topic.
   * 
   * @param {Topic} topic - The topic to create a quiz for
   */
  const handleOpenQuizModal = (topic: Topic): void => {
    setSelectedTopicForQuiz(topic);
    setModalOpen(true);
  };

  /**
   * Handle Close Quiz Modal
   * 
   * Closes the quiz settings modal and clears the selected topic.
   */
  const handleCloseQuizModal = (): void => {
    setModalOpen(false);
    setSelectedTopicForQuiz(null);
  };

  /**
   * Handle Start Quiz With Settings
   * 
   * Creates a quiz session with user-selected settings (difficulty,
   * time limit, number of questions). Converts time limit from minutes
   * (UI) to seconds (backend).
   * 
   * @param {any} settings - Quiz settings from modal (difficulty, timeLimit, numQuestions)
   */
  const handleStartQuizWithSettings = (settings: any): void => {
    // Don't proceed if no topic selected or user not authenticated
    if (!selectedTopicForQuiz || !currentUser) return;

    // Prepare session data for API
    const sessionData = {
      topicId: selectedTopicForQuiz.id, // Topic ID for the quiz
      difficulty: settings.difficulty, // Difficulty level
      // Convert minutes (from UI) to seconds for the backend/session usage
      timeLimit: Number(settings.timeLimit) * 60,
      numQuestions: settings.numQuestions || 10, // Default to 10 questions if not specified
      subject: currentSubject?.subjectKey, // Subject identifier
      topicName: selectedTopicForQuiz.name, // Display name for topic
      accentColor: currentSubject?.accentColorDark // Theme color for UI
    };

    // Create quiz session with these settings
    createSessionMutation.mutate(sessionData);
    // Close modal after starting quiz
    handleCloseQuizModal();
  };

  /**
   * Handle Study Flashcards
   * 
   * Navigates to the flashcards page for a specific topic.
   * 
   * @param {Topic} topic - The topic to study flashcards for
   */
  const handleStudyFlashcards = (topic: Topic): void => {
    navigate(`/flashcards/${topic.id}`);
  };

  // Error state: show error if subject not found and not loading
  const error = !currentSubject && !isLoading ? 'Subject not found' : null;

  return {
    subjectKey: subjectKey || '', // Current subject key from URL
    currentSubject, // Current subject object (or null)
    isLoading, // Combined loading state
    error, // Error message or null
    modalOpen, // Quiz settings modal visibility
    selectedTopicForQuiz, // Topic selected for quiz creation (or null)
    searchTerm, // Current search term
    setSearchTerm, // Function to update search term
    selectedClass, // Currently selected class filter
    setSelectedClass, // Function to update class filter
    selectedGenre, // Currently selected genre filter
    setSelectedGenre, // Function to update genre filter
    availableClasses, // Unique classes for filter dropdown
    availableGenres, // Unique genres for filter dropdown
    filteredTopics, // Topics filtered by search, class, and genre
    handleOpenQuizModal, // Handler for opening quiz modal
    handleCloseQuizModal, // Handler for closing quiz modal
    handleStartQuizWithSettings, // Handler for starting quiz with settings
    handleStudyFlashcards, // Handler for navigating to flashcards
    createSessionMutation, // React Query mutation for session creation
  };
};
