// src/hooks/useChallenges.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';

/**
 * A custom hook to manage all state and logic for the Challenges page.
 * @param {object | null} currentUser - The currently authenticated user object.
 * @returns {object} An object containing all the state, derived data, and handlers needed by the ChallengesPage component.
 */
export const useChallenges = (currentUser) => {
  const navigate = useNavigate();

  // --- State for Data Fetching ---
  const [recentResults, setRecentResults] = useState([]);
  const [isLoadingRecentResults, setIsLoadingRecentResults] = useState(false);
  const [recentResultsError, setRecentResultsError] = useState('');

  const [pendingReceivedChallenges, setPendingReceivedChallenges] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [pendingError, setPendingError] = useState('');

  // --- State for UI Modals/Interaction ---
  const [challengeSetupModalOpen, setChallengeSetupModalOpen] = useState(false);
  const [quizDataForChallenge, setQuizDataForChallenge] = useState(null);

  // --- Data Fetching Callbacks ---
  const fetchRecentResults = useCallback(async () => {
    if (!currentUser?.id || !currentUser?.token) {
      setRecentResults([]);
      return;
    }
    setIsLoadingRecentResults(true);
    setRecentResultsError('');
    try {
      // Fetch recent results (non-challenges) to initiate new challenges
      const response = await apiClient.get(`/api/results?userId=${currentUser.id}&limit=5&excludeChallenges=true`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setRecentResults(response.data || []);
    } catch (err) {
      setRecentResultsError(err.response?.data?.message || "Failed to load recent quiz attempts.");
    } finally {
      setIsLoadingRecentResults(false);
    }
  }, [currentUser]);

  const fetchPendingChallengeData = useCallback(async () => {
    if (!currentUser?.token) {
      setPendingReceivedChallenges([]);
      return;
    }
    setIsLoadingPending(true);
    setPendingError('');
    try {
      const pendingRes = await apiClient.get('/api/challenges/pending', {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setPendingReceivedChallenges(pendingRes.data || []);
    } catch (err) {
      console.error("Error fetching pending challenges:", err.response || err);
      setPendingError(err.response?.data?.message || "Failed to load pending challenges.");
    } finally {
      setIsLoadingPending(false);
    }
  }, [currentUser]);

  // --- Main useEffect to trigger data fetching ---
  useEffect(() => {
    if (currentUser) {
      fetchRecentResults();
      fetchPendingChallengeData();
    } else {
      // Clear data if user logs out
      setRecentResults([]);
      setPendingReceivedChallenges([]);
      setRecentResultsError('');
      setPendingError('');
    }
  }, [currentUser, fetchPendingChallengeData, fetchRecentResults]);

  // --- Event Handlers ---
  const handleOpenChallengeSetupFromRecent = (result) => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/challenges', message: "Please login to challenge a friend." } });
      return;
    }
    if (!result.questionsActuallyAttemptedIds || result.questionsActuallyAttemptedIds.length === 0) {
      alert("Cannot initiate challenge: This result has no question data.");
      return;
    }
    setQuizDataForChallenge({
      topicId: result.topicId,
      topicName: result.topicName,
      difficulty: result.difficulty,
      numQuestions: result.questionsActuallyAttemptedIds.length,
      quizClass: result.class,
      questionIds: result.questionsActuallyAttemptedIds,
      subject: result.subject
    });
    setChallengeSetupModalOpen(true);
  };
  
  const handleCloseChallengeSetupModal = () => {
      setChallengeSetupModalOpen(false);
      setQuizDataForChallenge(null);
  }

  const handleStartChallenge = (challenge) => {
    navigate(`/quiz/challenge-${challenge.id}`, {
      state: {
        quizType: 'challenge',
        challengeId: challenge.id,
        topicId: challenge.topic_id,
        topicName: challenge.topic_name || `Challenge #${challenge.id}`,
        difficulty: challenge.difficulty,
        numQuestions: challenge.num_questions,
        quizClass: challenge.quiz_class,
        questionIds: challenge.question_ids_json ? JSON.parse(challenge.question_ids_json) : null,
        subject: challenge.subject || challenge.topic_id.split('-')[0] || 'challenge',
        timeLimit: challenge.time_limit || null,
        currentChallengeDetails: challenge
      }
    });
  };

  // --- Return all state and handlers ---
  return {
    // Data and states
    recentResults,
    isLoadingRecentResults,
    recentResultsError,
    pendingReceivedChallenges,
    isLoadingPending,
    pendingError,
    challengeSetupModalOpen,
    quizDataForChallenge,
    // Handlers
    handleOpenChallengeSetupFromRecent,
    handleCloseChallengeSetupModal,
    handleStartChallenge
  };
};