// src/hooks/useResults.js
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions } from '../utils/quizUtils';
import { useTopics } from '../contexts/TopicsContext';

// --- Fetcher Functions ---
const fetchAllResults = async () => {
    const { data } = await apiClient.get('/api/results');
    return data || [];
};

const fetchQuestionsForTopic = async (topicId) => {
    if (!topicId) return [];
    const { data } = await apiClient.get(`/api/questions?topicId=${topicId}`);
    return parseQuestionOptions(data || []);
};

export const useResults = (resultId) => {
    const { currentUser } = useAuth();
    const { topics: allTopics } = useTopics(); // Get topics from the context

    // --- START OF THE DEFINITIVE FIX ---

    // 1. Fetch the entire list of results. This query is ALWAYS enabled for a logged-in user.
    // On a hard refresh of /results/38, this will run and populate the cache.
    const { data: allResults = [], isLoading: isLoadingList, error: listError } = useQuery({
        queryKey: ['userResults', currentUser?.id],
        queryFn: fetchAllResults,
        enabled: !!currentUser,
    });

    // 2. Memoize the enriched list (adding topic names).
    const historicalList = useMemo(() => {
        if (isLoadingList || allTopics.length === 0) return [];
        return allResults.map(res => {
            const topicInfo = allTopics.find(t => t.id === res.topicId);
            return { ...res, topicName: topicInfo ? topicInfo.name : res.topicId.replace(/-/g, ' ') };
        });
    }, [allResults, allTopics, isLoadingList]);

    // 3. Find the specific result for the detail page from the now-reliable list.
    const singleResultData = useMemo(() => {
        if (!resultId || historicalList.length === 0) return null;
        return historicalList.find(r => String(r.id) === String(resultId));
    }, [resultId, historicalList]);

    const topicIdForDetail = singleResultData?.topicId;

    // 4. Fetch the questions for the detailed view only when we have a result and topicId.
    const { data: detailQuestions = [], isLoading: isLoadingDetailQuestions } = useQuery({
        queryKey: ['questions', topicIdForDetail],
        queryFn: () => fetchQuestionsForTopic(topicIdForDetail),
        enabled: !!topicIdForDetail,
    });
    
    // 5. Assemble the final detailData object.
    const detailData = useMemo(() => {
        if (!singleResultData || detailQuestions.length === 0) return null;
        
        const attemptedIds = JSON.parse(singleResultData.questionsActuallyAttemptedIds || '[]');
        const userAnswers = JSON.parse(singleResultData.userAnswersSnapshot || '{}');

        const detailedQuestions = attemptedIds.map(qId => {
            const fullData = detailQuestions.find(q => q.id === qId) || { id: qId, text: `Question data not found.`, options: [] };
            const userAnswerId = userAnswers[qId];
            return { ...fullData, userAnswerId, isCorrect: userAnswerId === fullData.correctOptionId, isAnswered: userAnswerId != null };
        });

        return { result: singleResultData, detailedQuestions };
    }, [singleResultData, detailQuestions]);

    // --- END OF THE DEFINITIVE FIX ---

    return {
        historicalList,
        detailData,
        isLoading: resultId ? (isLoadingList || isLoadingDetailQuestions) : isLoadingList,
        error: listError ? listError.message : null,
    };
};