// src/hooks/useChallenges.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // <-- Import useQuery
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

// --- Fetcher Functions ---
const fetchRecentResults = async () => {
  const { data } = await apiClient.get('/api/results?limit=5&excludeChallenges=true');
  return data || [];
};

const fetchPendingChallenges = async () => {
  const { data } = await apiClient.get('/api/challenges/pending');
  return data || [];
};

export const useChallenges = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // --- UI State for Modal ---
  const [challengeSetupModalOpen, setChallengeSetupModalOpen] = useState(false);
  const [quizDataForChallenge, setQuizDataForChallenge] = useState(null);

  // --- Data Fetching with useQuery ---
  const { 
    data: recentResults = [], 
    isLoading: isLoadingRecentResults, 
    error: recentResultsError 
  } = useQuery({
    queryKey: ['recentResultsForChallenge', currentUser?.id],
    queryFn: fetchRecentResults,
    enabled: !!currentUser
  });

  const { 
    data: pendingReceivedChallenges = [], 
    isLoading: isLoadingPending, 
    error: pendingError 
  } = useQuery({
    queryKey: ['pendingChallenges', currentUser?.id],
    queryFn: fetchPendingChallenges,
    enabled: !!currentUser
  });
  
  // --- Event Handlers (remain the same for now) ---
  const handleOpenChallengeSetupFromRecent = (result) => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/challenges', message: "Please login to challenge a friend." } });
      return;
    }
    if (!result.questionsActuallyAttemptedIds || JSON.parse(result.questionsActuallyAttemptedIds).length === 0) {
      alert("Cannot initiate challenge: This result has no question data.");
      return;
    }
    setQuizDataForChallenge({
      topicId: result.topicId,
      topicName: result.topicName,
      difficulty: result.difficulty,
      numQuestions: JSON.parse(result.questionsActuallyAttemptedIds).length,
      quizClass: result.class,
      questionIds: JSON.parse(result.questionsActuallyAttemptedIds),
      subject: result.subject
    });
    setChallengeSetupModalOpen(true);
  };
  
  const handleCloseChallengeSetupModal = () => {
    setChallengeSetupModalOpen(false);
    setQuizDataForChallenge(null);
  };

  const handleStartChallenge = (challenge) => {
    navigate(`/quiz/${challenge.topic_id}`, {
      state: {
        quizType: 'challenge',
        challengeId: challenge.id,
        topicId: challenge.topic_id,
        topicName: challenge.topic_name,
        difficulty: challenge.difficulty,
        numQuestions: challenge.num_questions,
        questionIds: JSON.parse(challenge.question_ids_json),
        subject: challenge.topic_id.split('-')[0] || 'challenge',
        currentChallengeDetails: challenge
      }
    });
  };

  return {
    recentResults,
    isLoadingRecentResults,
    recentResultsError: recentResultsError ? recentResultsError.message : null,
    pendingReceivedChallenges,
    isLoadingPending,
    pendingError: pendingError ? pendingError.message : null,
    challengeSetupModalOpen,
    quizDataForChallenge,
    handleOpenChallengeSetupFromRecent,
    handleCloseChallengeSetupModal,
    handleStartChallenge
  };
};