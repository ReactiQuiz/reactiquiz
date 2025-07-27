// src/hooks/useHomibhabha.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import apiClient from '../api/axiosInstance';
import { useMutation } from '@tanstack/react-query'; // <-- Import useMutation

export const useHomibhabha = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [pyqModalOpen, setPyqModalOpen] = useState(false);
  const [practiceTestModalOpen, setPracticeTestModalOpen] = useState(false);
  const homiBhabhaAccentColor = theme.palette.secondary.main;

  // --- START OF FIX: Use a single mutation for starting any quiz ---
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

  const handleStartPyqTest = (settings) => {
    const quizParams = {
        quizType: 'homibhabha-pyq',
        topicId: `pyq-${settings.class}-${settings.year}`,
        difficulty: 'mixed', 
        numQuestions: 100, 
        topicName: `Homi Bhabha PYQ ${settings.class}th - ${settings.year}`,
        accentColor: homiBhabhaAccentColor,
        quizClass: settings.class,
        subject: "homibhabha",
    };
    createSessionMutation.mutate(quizParams);
    handleClosePyqModal();
  };

  const handleStartPracticeTest = (settings) => {
    const quizParams = {
        quizType: 'homibhabha-practice',
        topicId: `homibhabha-practice-${settings.class}`,
        quizClass: settings.class,
        difficulty: settings.difficulty,
        topicName: `Homi Bhabha Practice Test - Std ${settings.class}th (${settings.difficulty})`,
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
  // --- END OF FIX ---

  const handleOpenPyqModal = () => setPyqModalOpen(true);
  const handleClosePyqModal = () => setPyqModalOpen(false);
  const handleOpenPracticeTestModal = () => setPracticeTestModalOpen(true);
  const handleClosePracticeTestModal = () => setPracticeTestModalOpen(false);

  return {
    pyqModalOpen,
    practiceTestModalOpen,
    homiBhabhaAccentColor,
    handleOpenPyqModal,
    handleClosePyqModal,
    handleStartPyqTest,
    handleOpenPracticeTestModal,
    handleClosePracticeTestModal,
    handleStartPracticeTest,
    // Pass the mutation's loading state to the page/modals
    isCreatingSession: createSessionMutation.isPending,
  };
};