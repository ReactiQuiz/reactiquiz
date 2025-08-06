// src/hooks/useResults.js
import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { parseQuestionOptions } from '../utils/quizUtils';
import { useTopics } from '../contexts/TopicsContext';

// --- Fetcher Functions (defined outside the hook for clarity) ---
const fetchAllResults = async () => {
    const { data } = await apiClient.get('/api/results');
    return data || [];
};

const fetchQuestionsByIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    const idString = ids.join(',');
    const { data } = await apiClient.get(`/api/questions?ids=${idString}`);
    return parseQuestionOptions(data || []);
};

export const useResults = () => {
    const { resultId } = useParams();
    const { currentUser } = useAuth();
    const { topics: allTopics } = useTopics();

    // --- State for UI Controls (Filters and Sorting) ---
    const [filters, setFilters] = useState({ class: 'all', genre: 'all' });
    const [sortOrder, setSortOrder] = useState('date_desc'); // Default to most recent

// --- Add a function to clear filters ---
    const clearFilters = useCallback(() => {
        setFilters({ class: 'all', genre: 'all' });
        setSortOrder('date_desc'); // Also reset sort order to the default
    }, []);

    // --- Data Fetching Layer ---
    const { data: allResults = [], isLoading: isLoadingList, error: listError } = useQuery({
        queryKey: ['userResults', currentUser?.id],
        queryFn: fetchAllResults,
        enabled: !!currentUser,
    });

    // --- Data Processing Layer (Enriching, Filtering, Sorting) ---
    const historicalList = useMemo(() => {
        if (isLoadingList || allTopics.length === 0) return [];
        
        // 1. Enrich raw results with topic details like name, class, and genre.
        let enriched = allResults.map(res => {
            const topicInfo = allTopics.find(t => t.id === res.topicId);
            return { 
                ...res, 
                topicName: topicInfo?.name || res.topicId.replace(/-/g, ' '),
                class: topicInfo?.class,
                genre: topicInfo?.genre
            };
        });

        // 2. Apply filters based on the current state.
        let filtered = enriched;
        if (filters.class !== 'all') {
            filtered = filtered.filter(res => res.class === filters.class);
        }
        if (filters.genre !== 'all') {
            filtered = filtered.filter(res => res.genre === filters.genre);
        }

        // 3. Apply sorting based on the current order.
        switch (sortOrder) {
            case 'date_asc':
                filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                break;
            case 'score_desc':
                filtered.sort((a, b) => b.percentage - a.percentage);
                break;
            case 'score_asc':
                filtered.sort((a, b) => a.percentage - b.percentage);
                break;
            case 'date_desc':
            default:
                filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
        }

        return filtered;
    }, [allResults, allTopics, isLoadingList, filters, sortOrder]);

    // --- Derived State for Populating Filter Dropdowns ---
    const availableClasses = useMemo(() => {
        if (isLoadingList) return [];
        const classes = allResults
            .map(res => allTopics.find(t => t.id === res.topicId)?.class)
            .filter(Boolean);
        return [...new Set(classes)].sort();
    }, [allResults, allTopics, isLoadingList]);

    const availableGenres = useMemo(() => {
        if (isLoadingList) return [];
        const genres = allResults
            .map(res => allTopics.find(t => t.id === res.topicId)?.genre)
            .filter(Boolean);
        return [...new Set(genres)].sort();
    }, [allResults, allTopics, isLoadingList]);

    // --- Logic for the Detail View ---
    const singleResultData = useMemo(() => {
        if (!resultId || historicalList.length === 0) return null;
        return historicalList.find(r => String(r.id) === String(resultId));
    }, [resultId, historicalList]);

    const attemptedIds = useMemo(() => {
        if (!singleResultData) return [];
        try {
            const raw = JSON.parse(singleResultData.questionsActuallyAttemptedIds || '[]');
            return typeof raw[0] === 'object' ? raw.map(q => q.id) : raw;
        } catch { return []; }
    }, [singleResultData]);

    const isDataArchived = useMemo(() => {
        if (!singleResultData) return false;
        try {
            const raw = JSON.parse(singleResultData.questionsActuallyAttemptedIds || '[]');
            return Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object';
        } catch { return false; }
    }, [singleResultData]);

    const { data: detailQuestionsFromApi = [], isLoading: isLoadingDetailQuestions } = useQuery({
        queryKey: ['questions', resultId],
        queryFn: () => fetchQuestionsByIds(attemptedIds),
        enabled: !!resultId && attemptedIds.length > 0 && !isDataArchived,
    });

    const detailData = useMemo(() => {
        if (!singleResultData) return null;
        try {
            const userAnswers = JSON.parse(singleResultData.userAnswersSnapshot || '{}');
            const questionsSource = isDataArchived ? parseQuestionOptions(JSON.parse(singleResultData.questionsActuallyAttemptedIds)) : detailQuestionsFromApi;

            if (isLoadingDetailQuestions && !isDataArchived) return null;

            const detailedQuestions = attemptedIds.map(qId => {
                const fullData = questionsSource.find(q => q.id === qId) || { id: qId, text: `Question data for ID ${qId} could not be found.`, options: [] };
                return { ...fullData, userAnswerId: userAnswers[qId], isCorrect: userAnswers[qId] === fullData.correctOptionId, isAnswered: userAnswers[qId] != null };
            });
            return { result: singleResultData, detailedQuestions };
        } catch (e) { return null; }
    }, [singleResultData, detailQuestionsFromApi, isDataArchived, isLoadingDetailQuestions, attemptedIds]);

    return {
        historicalList,
        detailData,
        isLoading: isLoadingList || (resultId && !isDataArchived && isLoadingDetailQuestions),
        error: listError ? listError.message : null,
        filters, setFilters,
        sortOrder, setSortOrder,
        availableClasses, availableGenres, clearFilters,
    };
};