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

    const topicIdForDetail = singleResultData?.topicId;

    // --- START OF THE DEFINITIVE FIX ---

    // 1. Determine if the question data is already archived in the result object.
    const isDataArchived = useMemo(() => {
        if (!singleResultData?.questionsActuallyAttemptedIds) return false;
        try {
            const rawData = JSON.parse(singleResultData.questionsActuallyAttemptedIds);
            // If the first item is an object with a 'text' property, we assume it's archived full question data.
            return Array.isArray(rawData) && rawData.length > 0 && typeof rawData[0] === 'object' && 'text' in rawData[0];
        } catch {
            return false;
        }
    }, [singleResultData]);

    // 2. Only fetch questions from the API if the data is NOT archived.
    const { data: detailQuestionsFromApi = [], isLoading: isLoadingDetailQuestions } = useQuery({
        queryKey: ['questions', topicIdForDetail],
        queryFn: () => fetchQuestionsForTopic(topicIdForDetail),
        enabled: !!topicIdForDetail && !isDataArchived, // <-- Key change here
    });

    // 3. Assemble the final detailed data, prioritizing the archived data.
    const detailData = useMemo(() => {
        if (!singleResultData) return null;

        try {
            const userAnswers = JSON.parse(singleResultData.userAnswersSnapshot || '{}');
            const rawAttempted = JSON.parse(singleResultData.questionsActuallyAttemptedIds || '[]');

            // Determine the source of truth for the question data
            let questionsSource = [];
            if (isDataArchived) {
                questionsSource = parseQuestionOptions(rawAttempted); // Use the archived data
            } else {
                if (isLoadingDetailQuestions) return null; // Wait for API fetch to finish
                questionsSource = detailQuestionsFromApi; // Use the data from the API
            }

            if (questionsSource.length === 0) return { result: singleResultData, detailedQuestions: [] }; // Handle case where questions might be empty

            const attemptedIds = questionsSource.map(q => q.id);

            const detailedQuestions = attemptedIds.map(qId => {
                const fullData = questionsSource.find(q => q.id === qId) || { id: qId, text: `Question data not found.`, options: [] };
                const userAnswerId = userAnswers[qId];
                return { ...fullData, userAnswerId, isCorrect: userAnswerId === fullData.correctOptionId, isAnswered: userAnswerId != null };
            });

            return { result: singleResultData, detailedQuestions };

        } catch (e) {
            console.error("Failed to parse result data:", e, singleResultData);
            return null;
        }
    }, [singleResultData, detailQuestionsFromApi, isDataArchived, isLoadingDetailQuestions]);

    // --- END OF THE DEFINITIVE FIX ---

    return {
        historicalList,
        detailData,
        isLoading: resultId ? (isLoadingList || (!isDataArchived && isLoadingDetailQuestions)) : isLoadingList,
        error: listError ? listError.message : null,
    };
};