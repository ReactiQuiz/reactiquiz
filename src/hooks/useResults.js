// src/hooks/useResults.js
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions } from '../utils/quizUtils';
import { useTopics } from '../contexts/TopicsContext';

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
    const { topics: allTopics } = useTopics();

    // 1. Fetch the entire list of results. This is the source of truth.
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

    // 3. Find the specific result for the detail page from the reliable list.
    const singleResultData = useMemo(() => {
        if (!resultId || historicalList.length === 0) return null;
        return historicalList.find(r => String(r.id) === String(resultId));
    }, [resultId, historicalList]);

    const topicIdForDetail = singleResultData?.topicId;

    // 4. Fetch the questions for the detailed view.
    const { data: detailQuestions = [], isLoading: isLoadingDetailQuestions } = useQuery({
        queryKey: ['questions', topicIdForDetail],
        queryFn: () => fetchQuestionsForTopic(topicIdForDetail),
        enabled: !!topicIdForDetail,
    });
    
    // 5. Assemble the final detailData object with robust parsing.
    const detailData = useMemo(() => {
        if (!singleResultData || !detailQuestions) return null;
        
        try {
            const userAnswers = JSON.parse(singleResultData.userAnswersSnapshot || '{}');
            
            // --- START OF THE DEFINITIVE FIX ---
            // This logic robustly handles both formats: an array of strings OR an array of objects.
            let attemptedIds = [];
            const rawAttempted = JSON.parse(singleResultData.questionsActuallyAttemptedIds || '[]');
            
            if (rawAttempted.length > 0) {
                if (typeof rawAttempted[0] === 'object' && rawAttempted[0] !== null && 'id' in rawAttempted[0]) {
                    // It's an array of question objects, so we map to get the IDs.
                    attemptedIds = rawAttempted.map(q => q.id);
                } else {
                    // It's already an array of strings (the expected format).
                    attemptedIds = rawAttempted;
                }
            }
            // --- END OF THE DEFINITIVE FIX ---

            // If we have questions for a standard quiz, use those. Otherwise, use the embedded questions.
            const questionsSource = detailQuestions.length > 0 ? detailQuestions : rawAttempted;

            const detailedQuestions = attemptedIds.map(qId => {
                const fullData = questionsSource.find(q => q.id === qId) || { id: qId, text: `Question data not found.`, options: [] };
                const userAnswerId = userAnswers[qId];
                return { ...fullData, userAnswerId, isCorrect: userAnswerId === fullData.correctOptionId, isAnswered: userAnswerId != null };
            });

            return { result: singleResultData, detailedQuestions };

        } catch (e) {
            console.error("Failed to parse result data:", e, singleResultData);
            return null; // Return null if any parsing fails, preventing a crash.
        }
    }, [singleResultData, detailQuestions]);

    return {
        historicalList,
        detailData,
        isLoading: resultId ? (isLoadingList || isLoadingDetailQuestions) : isLoadingList,
        error: listError ? listError.message : null,
    };
};