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

// --- START OF THE DEFINITIVE FIX: New Fetcher Function ---
// This new function fetches a specific set of questions by their IDs.
const fetchQuestionsByIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    // The API expects a comma-separated string
    const idString = ids.join(',');
    const { data } = await apiClient.get(`/api/questions?ids=${idString}`);
    return parseQuestionOptions(data || []);
};
// --- END OF THE DEFINITIVE FIX ---

export const useResults = (resultId) => {
    const { currentUser } = useAuth();
    const { topics: allTopics } = useTopics();

    const { data: allResults = [], isLoading: isLoadingList, error: listError } = useQuery({
        queryKey: ['userResults', currentUser?.id],
        queryFn: fetchAllResults,
        enabled: !!currentUser,
    });

    const historicalList = useMemo(() => {
        if (isLoadingList || allTopics.length === 0) return [];
        return allResults.map(res => {
            const topicInfo = allTopics.find(t => t.id === res.topicId);
            return { ...res, topicName: topicInfo ? topicInfo.name : res.topicId.replace(/-/g, ' ') };
        });
    }, [allResults, allTopics, isLoadingList]);

    const singleResultData = useMemo(() => {
        if (!resultId || historicalList.length === 0) return null;
        return historicalList.find(r => String(r.id) === String(resultId));
    }, [resultId, historicalList]);

    // --- START OF THE DEFINITIVE FIX: Robust Data Fetching for Details ---

    // 1. Memoize the parsing of attempted question IDs from the result object.
    const attemptedIds = useMemo(() => {
        if (!singleResultData?.questionsActuallyAttemptedIds) return [];
        try {
            const rawAttempted = JSON.parse(singleResultData.questionsActuallyAttemptedIds);
            if (rawAttempted.length > 0 && typeof rawAttempted[0] === 'object') {
                return rawAttempted.map(q => q.id); // It's an array of objects
            }
            return rawAttempted; // It's an array of strings
        } catch {
            return [];
        }
    }, [singleResultData]);

    // 2. Determine if the question data is already archived (for Homi Bhabha quizzes).
    const isDataArchived = useMemo(() => {
        if (!singleResultData?.questionsActuallyAttemptedIds) return false;
        try {
            const rawData = JSON.parse(singleResultData.questionsActuallyAttemptedIds);
            return Array.isArray(rawData) && rawData.length > 0 && typeof rawData[0] === 'object';
        } catch { return false; }
    }, [singleResultData]);

    // 3. Fetch the specific questions using our new fetcher, but only if the data isn't archived.
    const { data: detailQuestionsFromApi = [], isLoading: isLoadingDetailQuestions } = useQuery({
        queryKey: ['questions', resultId], // A unique key for this specific result's questions
        queryFn: () => fetchQuestionsByIds(attemptedIds),
        enabled: !!resultId && attemptedIds.length > 0 && !isDataArchived,
    });

    // 4. Assemble the final detailed data, prioritizing the correct source.
    const detailData = useMemo(() => {
        if (!singleResultData) return null;
        try {
            const userAnswers = JSON.parse(singleResultData.userAnswersSnapshot || '{}');
            
            let questionsSource = [];
            if (isDataArchived) {
                // For Homi Bhabha, the questions are stored directly in the result.
                questionsSource = parseQuestionOptions(JSON.parse(singleResultData.questionsActuallyAttemptedIds));
            } else {
                // For standard quizzes, use the data we just fetched from the API.
                if (isLoadingDetailQuestions) return null; // Wait for the fetch to complete
                questionsSource = detailQuestionsFromApi;
            }

            const detailedQuestions = attemptedIds.map(qId => {
                const fullData = questionsSource.find(q => q.id === qId);
                // If a question is somehow missing (e.g., deleted from DB), show a clear message.
                if (!fullData) return { id: qId, text: `Question data for ID ${qId} could not be found.`, options: [], userAnswerId: userAnswers[qId] };
                
                const userAnswerId = userAnswers[qId];
                return { ...fullData, userAnswerId, isCorrect: userAnswerId === fullData.correctOptionId, isAnswered: userAnswerId != null };
            });

            return { result: singleResultData, detailedQuestions };
        } catch (e) {
            console.error("Failed to parse result data:", e);
            return null;
        }
    }, [singleResultData, detailQuestionsFromApi, isDataArchived, isLoadingDetailQuestions, attemptedIds]);

    // --- END OF THE DEFINITIVE FIX ---

    return {
        historicalList,
        detailData,
        isLoading: resultId ? (isLoadingList || (!isDataArchived && isLoadingDetailQuestions)) : isLoadingList,
        error: listError ? listError.message : null,
    };
};