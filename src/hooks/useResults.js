// src/hooks/useResults.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions as parseQuestionOptionsForResults, formatDisplayTopicName } from '../utils/quizUtils';

/**
 * A custom hook to manage all state and logic for the Results page.
 */
export const useResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const currentQuizDataFromState = location.state;

  // --- State for Views & Animation ---
  const [showRevealAnimation, setShowRevealAnimation] = useState(
    currentQuizDataFromState?.isFirstResultView === true
  );
  const [selectedHistoricalResult, setSelectedHistoricalResult] = useState(null);
  
  // --- State for Data Fetching ---
  const [historicalResults, setHistoricalResults] = useState([]);
  const [isLoadingHistoricalList, setIsLoadingHistoricalList] = useState(false);
  const [fetchListError, setFetchListError] = useState('');

  const [processedHistoricalDetailedView, setProcessedHistoricalDetailedView] = useState([]);
  const [isLoadingHistoricalDetails, setIsLoadingHistoricalDetails] = useState(false);
  const [detailsFetchError, setDetailsFetchError] = useState('');

  // --- State for Modals & Dialogs ---
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [resultToDeleteId, setResultToDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [challengeSetupModalOpen, setChallengeSetupModalOpen] = useState(false);
  const [quizDataForChallenge, setQuizDataForChallenge] = useState(null);

  // --- Derived State (View Determination) ---
  const isShowingCurrentQuizResult = useMemo(() => 
    !!(currentQuizDataFromState?.originalQuestionsForDisplay && !selectedHistoricalResult),
    [currentQuizDataFromState, selectedHistoricalResult]
  );

  // --- Data Fetching Logic ---
  const fetchHistoricalData = useCallback(async () => {
    if (!currentUser?.token) {
      setHistoricalResults([]);
      setIsLoadingHistoricalList(false);
      return;
    }
    setIsLoadingHistoricalList(true);
    setFetchListError('');
    try {
      const response = await apiClient.get(`/api/results?userId=${currentUser.id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      if (Array.isArray(response.data)) {
        const formattedResults = response.data.map(result => ({
          ...result,
          topicName: formatDisplayTopicName(result.topicId, result.topicName, !!result.challenge_id, result)
        }));
        setHistoricalResults(formattedResults);
      } else {
        throw new Error('Invalid data format for past results.');
      }
    } catch (error) {
      setFetchListError(`Failed to load past results: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoadingHistoricalList(false);
    }
  }, [currentUser]);

  // --- Effects ---
  useEffect(() => {
    // Fetch historical list if we are not showing a current result or a detailed view.
    if (!isShowingCurrentQuizResult && !selectedHistoricalResult && !showRevealAnimation) {
      fetchHistoricalData();
    }
  }, [isShowingCurrentQuizResult, selectedHistoricalResult, showRevealAnimation, fetchHistoricalData]);

  useEffect(() => {
    // Fetch details for a selected historical result.
    if (selectedHistoricalResult?.id) {
      setIsLoadingHistoricalDetails(true);
      setDetailsFetchError('');
      apiClient.get(`/api/questions?topicId=${selectedHistoricalResult.topicId}`)
        .then(response => {
          if (!Array.isArray(response.data)) throw new Error("Invalid question details format.");
          const allTopicQuestionsParsed = parseQuestionOptionsForResults(response.data);
          const populatedQuestions = selectedHistoricalResult.questionsActuallyAttemptedIds.map(qId => {
            const fullQuestionData = allTopicQuestionsParsed.find(q => q.id === qId);
            if (!fullQuestionData) return { id: qId, text: `Question data (ID: ${qId}) not found.`, options: [], isCorrect: false };
            const userAnswerId = selectedHistoricalResult.userAnswersSnapshot[qId];
            return { ...fullQuestionData, userAnswerId, isCorrect: userAnswerId === fullQuestionData.correctOptionId, isAnswered: !!userAnswerId };
          });
          setProcessedHistoricalDetailedView(populatedQuestions);
        })
        .catch(err => setDetailsFetchError(`Failed to load details: ${err.message}`))
        .finally(() => setIsLoadingHistoricalDetails(false));
    } else {
      setProcessedHistoricalDetailedView([]);
    }
  }, [selectedHistoricalResult]);


  // --- Event Handlers ---
  const handleAnimationComplete = () => {
    setShowRevealAnimation(false);
    if (currentQuizDataFromState) {
      navigate(location.pathname, { state: { ...currentQuizDataFromState, isFirstResultView: false }, replace: true });
    }
  };

  const handleViewHistoricalResultDetail = (result) => {
    setShowRevealAnimation(false);
    setDetailsFetchError('');
    setSelectedHistoricalResult(result);
  };

  const handleBackToList = () => {
    setSelectedHistoricalResult(null);
    setProcessedHistoricalDetailedView([]);
    setDetailsFetchError('');
    navigate('/results', { replace: true, state: null }); // Clear location state
  };
  
  const handleNavigateHome = () => navigate('/');

  const openDeleteConfirmation = (id) => { setResultToDeleteId(id); setDeleteConfirmationOpen(true); };
  const closeDeleteConfirmation = () => { setResultToDeleteId(null); setDeleteConfirmationOpen(false); setDeleteError(''); };

  const handleConfirmDelete = async () => {
    if (!resultToDeleteId || !currentUser?.token) return;
    try {
      await apiClient.delete(`/api/results/${resultToDeleteId}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
      closeDeleteConfirmation();
      if (selectedHistoricalResult?.id === resultToDeleteId) {
        handleBackToList();
      } else {
        fetchHistoricalData();
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete result.");
    }
  };
  
  const handleOpenChallengeSetup = (sourceResult) => {
    const questionIds = Array.isArray(sourceResult.originalQuestionsForDisplay)
        ? sourceResult.originalQuestionsForDisplay.map(q => q.id)
        : sourceResult.questionsActuallyAttemptedIds;
    if (!questionIds?.length) { alert("No questions found to base a challenge on."); return; }

    setQuizDataForChallenge({
      topicId: sourceResult.topicId,
      topicName: formatDisplayTopicName(sourceResult.topicId, sourceResult.topicName, !!sourceResult.challenge_id, sourceResult),
      difficulty: sourceResult.difficulty,
      numQuestions: questionIds.length,
      quizClass: sourceResult.class || sourceResult.quizClass,
      questionIds: questionIds,
      subject: sourceResult.subject
    });
    setChallengeSetupModalOpen(true);
  };
  
  const handleCloseChallengeSetupModal = () => setChallengeSetupModalOpen(false);

  return {
    currentUser,
    currentQuizDataFromState,
    showRevealAnimation,
    isShowingCurrentQuizResult,
    selectedHistoricalResult,
    historicalResults,
    isLoadingHistoricalList,
    fetchListError,
    processedHistoricalDetailedView,
    isLoadingHistoricalDetails,
    detailsFetchError,
    deleteConfirmationOpen,
    resultToDeleteId,
    deleteError,
    challengeSetupModalOpen,
    quizDataForChallenge,
    handleAnimationComplete,
    handleViewHistoricalResultDetail,
    handleBackToList,
    handleNavigateHome,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
    handleOpenChallengeSetup,
    handleCloseChallengeSetupModal
  };
};