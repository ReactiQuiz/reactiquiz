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
  numQuestions?: number; // Number of questions in the quiz
  topicName: string; // Display name for the topic
  accentColor: string; // Accent color for UI theming
  quizClass?: string; // Class/grade level for the quiz
  subject: string; // Subject identifier
  timeLimit?: number; // Time limit in seconds
  questionComposition?: any; // Composition of questions by subject (physics, chemistry, etc.)
  totalQuestions?: number; // Total number of questions
}

export const useHomibhabha = (): UseHomibhabhaReturn => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { addNotification } = useNotifications(); 

  const [pyqModalOpen, setPyqModalOpen] = useState<boolean>(false);
  const [practiceTestModalOpen, setPracticeTestModalOpen] = useState<boolean>(false);
  const homiBhabhaAccentColor = theme.palette.secondary.main;

  const createSessionMutation = useMutation({
    mutationFn: (quizParams: QuizParams) => apiClient.post('/api/quizSessions', { quizParams }),
    onSuccess: (response: any) => {
      const { sessionId } = response.data;
      localStorage.setItem('activeQuizSessionId', sessionId);
      navigate('/quiz/loading');
    },
    onError: (err: any) => {
        const message = err.response?.data?.message || "Could not start the quiz. Please try again.";
        addNotification(message, 'error');
    }
  });

  const handleStartPyqTest = (settings: any) => {
    const quizParams = {
        quizType: 'homibhabha-pyq',
        topicId: `pyq-${settings.class}-${settings.year}`,
        numQuestions: 100,
        topicName: `Homi Bhabha PYQ ${settings.class}th - ${settings.year}`,
        accentColor: homiBhabhaAccentColor,
        quizClass: settings.class,
        subject: "homibhabha",
    };
    createSessionMutation.mutate(quizParams);
    handleClosePyqModal();
  };

  const handleStartPracticeTest = (settings: any) => {
    const quizParams = {
        quizType: 'homibhabha-practice',
        topicId: `homibhabha-practice-${settings.class}`,
        quizClass: settings.class,
        topicName: `Homi Bhabha Practice Test - Std ${settings.class}th`,
        accentColor: homiBhabhaAccentColor,
        subject: "homibhabha",
        timeLimit: 90 * 60,
        questionComposition: {
          physics: { total: 30 },
          chemistry: { total: 30 },
          biology: { total: 30 },
          gk: { total: 10 }
        },
        totalQuestions: 100
    };
    createSessionMutation.mutate(quizParams);
    handleClosePracticeTestModal();
  };

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