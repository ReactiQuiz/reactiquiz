// src/hooks/useHomibhabha.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import apiClient from '../api/axiosInstance'; // <-- ADD THIS IMPORT

export const useHomibhabha = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [pyqModalOpen, setPyqModalOpen] = useState(false);
  const [practiceTestModalOpen, setPracticeTestModalOpen] = useState(false);
  const homiBhabhaAccentColor = theme.palette.secondary.main;

  const handleOpenPyqModal = () => setPyqModalOpen(true);
  const handleClosePyqModal = () => setPyqModalOpen(false);
  const handleOpenPracticeTestModal = () => setPracticeTestModalOpen(true);
  const handleClosePracticeTestModal = () => setPracticeTestModalOpen(false);

  const handleStartPyqTest = async (settings) => {
    try {
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
        const response = await apiClient.post('/api/quiz-sessions', { quizParams });
        navigate(`/quiz/${response.data.sessionId}`);
    } catch (error) {
        console.error("Failed to create PYQ session", error);
        alert("Could not start the PYQ test. Please try again.");
    }
    handleClosePyqModal();
  };

  const handleStartPracticeTest = async (settings) => {
    try {
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
        const response = await apiClient.post('/api/quiz-sessions', { quizParams });
        navigate(`/quiz/${response.data.sessionId}`);
    } catch (error) {
        console.error("Failed to create practice test session", error);
        alert("Could not start the practice test. Please try again.");
    }
    handleClosePracticeTestModal();
  };

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
  };
};