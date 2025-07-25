// src/hooks/useResults.js
import { useMemo } from 'react';
// --- START OF FIX: Import useQueryClient ---
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
// --- END OF FIX ---
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions } from '../utils/quizUtils';

// --- Fetcher Functions ---
const fetchAllResults = async () => {
  const { data } = await apiClient.get('/api/results');
  return data || [];
};

const fetchAllTopics = async () => {
  const { data } = await apiClient.get('/api/topics');
  return data || [];
};

const fetchQuestionsForTopic = async (topicId) => {
  if (!topicId) return [];
  const { data } = await apiClient.get(`/api/questions?topicId=${topicId}`);
  return parseQuestionOptions(data || []);
};

export const useResults = (resultId) => {
  const { currentUser } = useAuth();
  // --- START OF FIX: Instantiate the query client ---
  const queryClient = useQueryClient();
  // --- END OF FIX ---

  // --- Fetch data for the LIST view ---
  const { data: allResults = [], isLoading: isLoadingList, error: listError } = useQuery({
    queryKey: ['userResults', currentUser?.id],
    queryFn: fetchAllResults,
    enabled: !!currentUser && !resultId,
  });
  
  const { data: allTopics = [] } = useQuery({
    queryKey: ['topics'],
    queryFn: fetchAllTopics,
    staleTime: Infinity,
  });

  const historicalList = useMemo(() => {
    return allResults.map(res => {
      const topicInfo = allTopics.find(t => t.id === res.topicId);
      return { ...res, topicName: topicInfo ? topicInfo.name : res.topicId.replace(/-/g, ' ') };
    });
  }, [allResults, allTopics]);

  // --- Fetch data for the DETAIL view ---
  const { data: singleResultData, isLoading: isLoadingSingleResult } = useQuery({
      queryKey: ['singleResult', resultId],
      queryFn: async () => {
        // Now 'queryClient' is correctly defined and can be used here
        const results = await queryClient.getQueryData(['userResults', currentUser?.id]) || await fetchAllResults();
        return results.find(r => String(r.id) === String(resultId));
      },
      enabled: !!currentUser && !!resultId,
  });

  const topicIdForDetail = singleResultData?.topicId;

  const { data: detailQuestions = [], isLoading: isLoadingDetailQuestions } = useQuery({
    queryKey: ['questions', topicIdForDetail],
    queryFn: () => fetchQuestionsForTopic(topicIdForDetail),
    enabled: !!topicIdForDetail,
  });

  const detailData = useMemo(() of => {
    if (!resultId || !singleResultData || !detailQuestions || detailQuestions.length === 0) return null;

    const topicInfo = allTopics.find(t => t.id === singleResultData.topicId);
    const enrichedResult = { ...singleResultData, topicName: topicInfo ? topicInfo.name : singleResultData.topicId.replace(/-/g, ' ') };
    
    const attemptedIds = JSON.parse(singleResultData.questionsActuallyAttemptedIds || '[]');
    const userAnswers = JSON.parse(singleResultData.userAnswersSnapshot || '{}');

    const detailedQuestions = attemptedIds.map(qId => {
      const fullData = detailQuestions.find(q => q.id === qId) || { id: qId, text: `Question data not found.`, options: [] };
      const userAnswerId = userAnswers[qId];
      return { ...fullData, userAnswerId, isCorrect: userAnswerId === fullData.correctOptionId, isAnswered: userAnswerId != null };
    });

    return { result: enrichedResult, detailedQuestions };
  }, [resultId, singleResultData, detailQuestions, allTopics]);

  return {
    historicalList,
    detailData,
    isLoading: resultId ? (isLoadingSingleResult || isLoadingDetailQuestions) : isLoadingList,
    error: resultId ? null : (listError ? listError.message : null),
  };
};