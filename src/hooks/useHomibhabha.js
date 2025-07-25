// src/hooks/useHomibhabha.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

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

  const handleStartPyqTest = (settings) => {
    // This logic remains the same
    navigate(`/quiz/pyq-${settings.class}-${settings.year}`, {
      state: {
        quizType: 'homibhabha-pyq', // Specific type for PYQs
        topicId: `pyq-${settings.class}-${settings.year}`,
        difficulty: 'mixed', 
        numQuestions: 100, 
        topicName: `Homi Bhabha PYQ ${settings.class}th - ${settings.year}`,
        accentColor: homiBhabhaAccentColor,
        quizClass: settings.class,
        subject: "homibhabha",
        isPYQ: true,
        year: settings.year
      }
    });
    handleClosePyqModal();
  };

  // --- START OF FIX ---
  const handleStartPracticeTest = (settings) => {
    // Navigate to a generic practice test URL, the state object contains all the logic
    navigate(`/quiz/homibhabha-practice-${settings.class}`, { 
      state: {
        quizType: 'homibhabha-practice', // A new, specific type for our composite quiz
        topicId: `homibhabha-practice-${settings.class}`, // A virtual topicId for the quiz
        quizClass: settings.class,
        difficulty: settings.difficulty,
        topicName: `Homi Bhabha Practice Test - Std ${settings.class}th (${settings.difficulty})`,
        accentColor: homiBhabhaAccentColor,
        subject: "homibhabha",
        timeLimit: 90 * 60, // 90 minutes in seconds
        // This object tells the useQuiz hook exactly how to build the test
        questionComposition: {
          physics: { total: 30, class_7: 5, class_8: 5 },
          chemistry: { total: 30, class_7: 5, class_8: 5 },
          biology: { total: 30, class_7: 5, class_8: 5 },
          gk: { total: 10 } // GK has no class requirements
        },
        totalQuestions: 100
      }
    });
    handleClosePracticeTestModal();
  };
  // --- END OF FIX ---

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