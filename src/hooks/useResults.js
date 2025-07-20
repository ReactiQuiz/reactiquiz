// src/hooks/useResults.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

export const useResults = (resultId) => {
    const { currentUser } = useAuth();
    const [historicalList, setHistoricalList] = useState([]);
    const [detailData, setDetailData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('reactiquizToken');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };

            // --- START OF FIX: Fetch all topics data once for enrichment ---
            const { data: allTopics } = await apiClient.get('/api/topics');
            // --- END OF FIX ---

            if (resultId) {
                // --- Fetch data for a SINGLE detailed view ---
                const { data: allResults } = await apiClient.get('/api/results', authHeader);
                const result = allResults.find(r => String(r.id) === String(resultId));

                if (!result) throw new Error("Result not found or you don't have permission to view it.");

                // --- START OF FIX: Enrich the single result with its topicName ---
                const topicInfo = allTopics.find(t => t.id === result.topicId);
                const enrichedResult = {
                    ...result,
                    topicName: topicInfo ? topicInfo.name : result.topicId.replace(/-/g, ' ') // Add the name
                };
                // --- END OF FIX ---

                const { data: questions } = await apiClient.get(`/api/questions?topicId=${result.topicId}`);
                
                const attemptedIds = result.questionsActuallyAttemptedIds ? JSON.parse(result.questionsActuallyAttemptedIds) : [];
                const userAnswers = result.userAnswersSnapshot ? JSON.parse(result.userAnswersSnapshot) : {};

                const detailedQuestions = attemptedIds.map(qId => {
                    const fullData = questions.find(q => q.id === qId) || { id: qId, text: `Question data not found.`, options: []};
                    const userAnswerId = userAnswers[qId];
                    return { ...fullData, userAnswerId, isCorrect: userAnswerId === fullData.correctOptionId, isAnswered: userAnswerId != null };
                });

                setDetailData({ result: enrichedResult, detailedQuestions });

            } else {
                // --- Fetch data for the LIST view ---
                const { data } = await apiClient.get('/api/results', authHeader);
                
                // --- START OF FIX: Enrich the entire list with topicNames ---
                const enrichedList = (data || []).map(res => {
                    const topicInfo = allTopics.find(t => t.id === res.topicId);
                    return {
                        ...res,
                        topicName: topicInfo ? topicInfo.name : res.topicId.replace(/-/g, ' ')
                    };
                });
                setHistoricalList(enrichedList);
                // --- END OF FIX ---
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch data.');
            console.error("Error fetching results:", err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, resultId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { historicalList, detailData, isLoading, error };
};