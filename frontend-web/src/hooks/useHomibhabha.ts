// src/hooks/useHomibhabha.ts
/**
 * Homi Bhabha Hook
 * 
 * This hook manages the Homi Bhabha exam quiz functionality, including
 * PYQ (Previous Year Questions) tests and practice tests. It handles
 * quiz session creation and modal state management.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import apiClient from '../api/axiosInstance';
import { useMutation } from '@tanstack/react-query';
import { useNotifications } from '../contexts/NotificationsContext';
import { UseHomibhabhaReturn } from '../types';

/**
 * QuizParams Interface
 * 
 * Parameters structure for creating a Homi Bhabha quiz session.
 * Includes quiz type, topic, difficulty, and other quiz configuration.
 */
interface QuizParams {
  quizType: string; // Type of quiz (e.g., 'homibhabha-pyq', 'homibhabha-practice')
  topicId: string; // Topic identifier for the quiz
  difficulty?: string; // Difficulty level (easy, medium, hard, mixed)
  numQuestions?: number; // Number of questions in the quiz
  topicName: string; // Display name for the topic
  accentColor: string; // Accent color for UI theming
  quizClass?: string; // Class/grade level for the quiz
  subject: string; // Subject identifier
  timeLimit?: number; // Time limit in seconds
  questionComposition?: any; // Composition of questions by subject (physics, chemistry, etc.)
  totalQuestions?: number; // Total number of questions
}

/**
 * useHomibhabha Hook
 * 
 * Custom hook that manages Homi Bhabha exam quiz functionality.
 * Handles two types of quizzes:
 * 1. PYQ (Previous Year Questions) tests - based on past exam papers
 * 2. Practice tests - custom practice quizzes with configurable difficulty
 * 
 * Provides modal state management and quiz session creation functionality.
 * 
 * @returns {UseHomibhabhaReturn} Modal states, handlers, accent color, and session creation status
 */
export const useHomibhabha = (): UseHomibhabhaReturn => {
  // Navigation hook for routing after quiz creation
  const navigate = useNavigate();
  // Material-UI theme hook for colors
  const theme = useTheme();
  // Notification context for displaying success/error messages
  const { addNotification } = useNotifications(); 

  // State for PYQ (Previous Year Questions) modal visibility
  const [pyqModalOpen, setPyqModalOpen] = useState<boolean>(false);
  // State for practice test modal visibility
  const [practiceTestModalOpen, setPracticeTestModalOpen] = useState<boolean>(false);
  // Get accent color from theme's secondary color
  const homiBhabhaAccentColor = theme.palette.secondary.main;

  // --- START OF FIX: Use a single mutation for starting any quiz ---
  /**
   * Create Quiz Session Mutation
   * 
   * React Query mutation for creating a quiz session. Handles both
   * PYQ and practice test session creation with a unified approach.
   */
  const createSessionMutation = useMutation({
    mutationFn: (quizParams: QuizParams) => apiClient.post('/api/quizSessions', { quizParams }),
    onSuccess: (response: any) => {
      // Extract session ID from response
      const { sessionId } = response.data;
      // Store session ID in localStorage for quiz page access
      localStorage.setItem('activeQuizSessionId', sessionId);
      // Navigate to quiz loading page
      navigate('/quiz/loading');
    },
    onError: (err: any) => {
        // Extract error message or use default
        const message = err.response?.data?.message || "Could not start the quiz. Please try again.";
        // Show error notification
        addNotification(message, 'error');
    }
  });

  /**
   * Handle Start PYQ Test
   * 
   * Creates a PYQ (Previous Year Questions) quiz session based on
   * user-selected settings (class and year). The quiz uses mixed
   * difficulty and contains 100 questions from past papers.
   * 
   * @param {any} settings - Quiz settings containing class and year
   */
  const handleStartPyqTest = (settings: any) => {
    const quizParams = {
        quizType: 'homibhabha-pyq', // PYQ quiz type identifier
        topicId: `pyq-${settings.class}-${settings.year}`, // Generate topic ID from class and year
        difficulty: 'mixed', // Mixed difficulty from past papers
        numQuestions: 100, // Standard PYQ test has 100 questions
        topicName: `Homi Bhabha PYQ ${settings.class}th - ${settings.year}`, // Display name
        accentColor: homiBhabhaAccentColor, // Theme color for UI
        quizClass: settings.class, // Class level
        subject: "homibhabha", // Subject identifier
    };
    // Create quiz session with these parameters
    createSessionMutation.mutate(quizParams);
    // Close the modal after starting quiz
    handleClosePyqModal();
  };

  /**
   * Handle Start Practice Test
   * 
   * Creates a practice test quiz session with configurable difficulty.
   * Practice tests have a specific question composition:
   * - Physics: 30 questions
   * - Chemistry: 30 questions
   * - Biology: 30 questions
   * - General Knowledge: 10 questions
   * Total: 100 questions with 90-minute time limit
   * 
   * @param {any} settings - Quiz settings containing class and difficulty
   */
  const handleStartPracticeTest = (settings: any) => {
    const quizParams = {
        quizType: 'homibhabha-practice', // Practice test type identifier
        topicId: `homibhabha-practice-${settings.class}`, // Generate topic ID from class
        quizClass: settings.class, // Class level
        difficulty: settings.difficulty, // User-selected difficulty
        topicName: `Homi Bhabha Practice Test - Std ${settings.class}th (${settings.difficulty})`, // Display name
        accentColor: homiBhabhaAccentColor, // Theme color for UI
        subject: "homibhabha", // Subject identifier
        timeLimit: 90 * 60, // 90 minutes converted to seconds
        questionComposition: {
          physics: { total: 30 }, // 30 physics questions
          chemistry: { total: 30 }, // 30 chemistry questions
          biology: { total: 30 }, // 30 biology questions
          gk: { total: 10 } // 10 general knowledge questions
        },
        totalQuestions: 100 // Total of 100 questions
    };
    // Create quiz session with these parameters
    createSessionMutation.mutate(quizParams);
    // Close the modal after starting quiz
    handleClosePracticeTestModal();
  };
  // --- END OF FIX ---

  /**
   * Handle Open PYQ Modal
   * 
   * Opens the PYQ (Previous Year Questions) selection modal.
   */
  const handleOpenPyqModal = () => setPyqModalOpen(true);

  /**
   * Handle Close PYQ Modal
   * 
   * Closes the PYQ selection modal.
   */
  const handleClosePyqModal = () => setPyqModalOpen(false);

  /**
   * Handle Open Practice Test Modal
   * 
   * Opens the practice test configuration modal.
   */
  const handleOpenPracticeTestModal = () => setPracticeTestModalOpen(true);

  /**
   * Handle Close Practice Test Modal
   * 
   * Closes the practice test configuration modal.
   */
  const handleClosePracticeTestModal = () => setPracticeTestModalOpen(false);

  return {
    pyqModalOpen, // PYQ modal visibility state
    practiceTestModalOpen, // Practice test modal visibility state
    homiBhabhaAccentColor, // Theme accent color for Homi Bhabha UI
    handleOpenPyqModal, // Open PYQ modal handler
    handleClosePyqModal, // Close PYQ modal handler
    handleStartPyqTest, // Start PYQ test handler
    handleOpenPracticeTestModal, // Open practice test modal handler
    handleClosePracticeTestModal, // Close practice test modal handler
    handleStartPracticeTest, // Start practice test handler
    // Pass the mutation's loading state to the page/modals for loading indicators
    isCreatingSession: createSessionMutation.isPending,
  };
};