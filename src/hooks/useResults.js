// src/hooks/useResults.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions as parseQuestionOptionsForResults, formatDisplayTopicName } from '../utils/quizUtils';

export const useResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resultId } = useParams();
  const { currentUser } = useAuth();
  
  const [view, setView] = useState('loading');
  const [detailData, setDetailData] = useState(null);
  const [historicalList, setHistoricalList] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Use location.state directly to determine if animation should be shown
  const [showAnimation, setShowAnimation] = useState(location.state?.isFirstResultView === true);

  // Other state initializations...
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [resultToDeleteId, setResultToDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [challengeSetupModalOpen, setChallengeSetupModalOpen] = useState(false);
  const [quizDataForChallenge, setQuizDataForChallenge] = useState(null);

  const fetchResultById = useCallback(async (id) => {
    setIsLoading(true);
    setError('');
    try {
        if (!currentUser?.token) throw new Error("Authentication required to view saved results.");
        const response = await apiClient.get(`/api/results`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
        const allResults = response.data || [];
        const foundResult = allResults.find(r => String(r.id) === String(id));
        if (!foundResult) throw new Error(`Result with ID ${id} not found or you do not have permission to view it.`);
        const questionsResponse = await apiClient.get(`/api/questions?topicId=${foundResult.topicId}`);
        const allTopicQuestions = parseQuestionOptionsForResults(questionsResponse.data || []);
        const populatedQuestions = (foundResult.questionsActuallyAttemptedIds || []).map(qId => {
            const fullData = allTopicQuestions.find(q => q.id === qId) || { id: qId, text: `Question data (ID: ${qId}) not found.`, options: []};
            const userAnswerId = foundResult.userAnswersSnapshot ? foundResult.userAnswersSnapshot[qId] : null;
            return { ...fullData, userAnswerId, isCorrect: userAnswerId === fullData.correctOptionId, isAnswered: !!userAnswerId };
        });
        setDetailData({
            result: {...foundResult, topicName: formatDisplayTopicName(foundResult.topicId, foundResult.topicName, !!foundResult.challenge_id, foundResult)},
            detailedQuestions: populatedQuestions
        });
        setView('detail');
    } catch (err) {
        setError(err.message);
        setView('error');
    } finally {
        setIsLoading(false);
    }
  }, [currentUser?.token]);
  
  const fetchHistoricalList = useCallback(async () => {
    if (!currentUser?.token) { setIsLoading(false); setView('list'); setHistoricalList([]); return; }
    setIsLoading(true);
    setError('');
    try {
        const response = await apiClient.get(`/api/results?userId=${currentUser.id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
        setHistoricalList((response.data || []).map(r => ({ ...r, topicName: formatDisplayTopicName(r.topicId, r.topicName, !!r.challenge_id, r) })));
        setView('list');
    } catch (err) {
        setError(err.message);
        setHistoricalList([]);
        setView('error');
    } finally {
        setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const stateData = location.state;

    // --- THIS IS THE CORRECTED LOGIC ---
    // Priority 1: Handle a fresh result passed directly in the location state.
    if (stateData && stateData.originalQuestionsForDisplay) {
        setShowAnimation(stateData.isFirstResultView === true);
        
        setDetailData({
            result: { ...stateData, topicName: formatDisplayTopicName(stateData.topicId, stateData.topicName, stateData.isChallenge, stateData.challengeDetails) },
            detailedQuestions: (stateData.originalQuestionsForDisplay || []).map(q => ({...q, userAnswerId: stateData.originalAnswersForDisplay[q.id], isCorrect: stateData.originalAnswersForDisplay[q.id] === q.correctOptionId, isAnswered: !!stateData.originalAnswersForDisplay[q.id]}))
        });
        setView('detail');
        setIsLoading(false);
    } 
    // Priority 2: Handle a result requested by ID from the URL (e.g., refresh, link).
    else if (resultId) {
        fetchResultById(resultId);
    } 
    // Priority 3: Default to showing the historical list.
    else {
        fetchHistoricalList();
    }
  }, [resultId, location.state, fetchResultById, fetchHistoricalList]);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    if (location.state) {
        navigate(location.pathname, { state: { ...location.state, isFirstResultView: false }, replace: true });
    }
  };

  const handleBackToList = () => navigate('/results');
  const handleNavigateHome = () => navigate('/');
  const openDeleteConfirmation = (id) => { setResultToDeleteId(id); setDeleteConfirmationOpen(true); };
  const closeDeleteConfirmation = () => setDeleteConfirmationOpen(false);
  const handleConfirmDelete = async () => { if (!resultToDeleteId || !currentUser?.token) return; try { await apiClient.delete(`/api/results/${resultToDeleteId}`, { headers: { Authorization: `Bearer ${currentUser.token}` } }); closeDeleteConfirmation(); handleBackToList(); } catch (err) { setDeleteError(err.response?.data?.message || "Failed to delete result."); } };
  const handleOpenChallengeSetup = (sourceResult) => { const questionIds = Array.isArray(sourceResult.originalQuestionsForDisplay) ? sourceResult.originalQuestionsForDisplay.map(q => q.id) : sourceResult.questionsActuallyAttemptedIds; if (!questionIds?.length) { alert("No questions found to base a challenge on."); return; } setQuizDataForChallenge({ topicId: sourceResult.topicId, topicName: formatDisplayTopicName(sourceResult.topicId, sourceResult.topicName, !!sourceResult.challenge_id, sourceResult), difficulty: sourceResult.difficulty, numQuestions: questionIds.length, quizClass: sourceResult.class || sourceResult.quizClass, questionIds: questionIds, subject: sourceResult.subject }); setChallengeSetupModalOpen(true); };
  const handleCloseChallengeSetupModal = () => setChallengeSetupModalOpen(false);

  return {
    currentUser, view, isLoading, error, detailData, historicalList,
    showAnimation, handleAnimationComplete,
    deleteConfirmationOpen, deleteError, challengeSetupModalOpen, quizDataForChallenge,
    handleBackToList, handleNavigateHome, openDeleteConfirmation, closeDeleteConfirmation,
    handleConfirmDelete, handleOpenChallengeSetup, handleCloseChallengeSetupModal,
  };
};