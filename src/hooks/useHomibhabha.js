// src/hooks/useHomibhabha.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

/**
 * A custom hook to manage all state and logic for the HomibhabhaPage.
 * It handles modal visibility and the logic for starting different test types.
 */
export const useHomibhabha = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // --- State for Modals ---
  const [pyqModalOpen, setPyqModalOpen] = useState(false);
  const [practiceTestModalOpen, setPracticeTestModalOpen] = useState(false);
  
  // --- UI-related Data ---
  // We can also define the accent color here so the page doesn't have to.
  const homiBhabhaAccentColor = theme.palette.secondary.main;

  // --- Modal Handlers ---
  const handleOpenPyqModal = () => setPyqModalOpen(true);
  const handleClosePyqModal = () => setPyqModalOpen(false);

  const handleOpenPracticeTestModal = () => setPracticeTestModalOpen(true);
  const handleClosePracticeTestModal = () => setPracticeTestModalOpen(false);

  // --- Test Start Handlers (Navigation Logic) ---
  const handleStartPyqTest = (settings) => {
    console.log("Starting PYQ Test with settings:", settings);
    navigate(`/quiz/pyq-${settings.class}-${settings.year}`, {
      state: {
        difficulty: 'mixed', 
        numQuestions: 100, 
        topicName: `Homi Bhabha PYQ ${settings.class}th - ${settings.year}`,
        accentColor: homiBhabhaAccentColor,
        quizClass: settings.class,
        subject: "homibhabha-pyq",
        isPYQ: true,
        year: settings.year
      }
    });
    handleClosePyqModal();
  };

  const handleStartPracticeTest = (settings) => {
    console.log("Starting Homi Bhabha Practice Test with settings:", settings);
    navigate(`/quiz/homibhabha-practice-${settings.class}`, { 
      state: {
        quizType: 'homibhabha-practice',
        quizClass: settings.class,
        difficulty: settings.difficulty,
        topicName: `Homi Bhabha Practice Test - Std ${settings.class}th (${settings.difficulty})`,
        accentColor: homiBhabhaAccentColor,
        subject: "homibhabha",
        timeLimit: 90 * 60,
        questionComposition: {
          physics: 30,
          chemistry: 30,
          biology: 30,
          gk: 10
        },
        totalQuestions: 100
      }
    });
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