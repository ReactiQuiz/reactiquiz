// src/hooks/useResults.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

export const useResults = (resultId) => {
    const { currentUser } = useAuth();
    const [historicalList, setHistoricalList] = useState([]);
    const [detailData, setDetailData] = useState(null); // For single result
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

            if (resultId) {
                // --- Fetch data for a single detailed view ---
                const { data: allResults } = await apiClient.get('/api/results', authHeader);
                const result = allResults.find(r => String(r.id) === String(resultId));

                if (!result) throw new Error("Result not found.");

                const { data: questions } = await apiClient.get(`/api/questions?topicId=${result.topicId}`);
                
                const detailedQuestions = (result.questionsActuallyAttemptedIds ? JSON.parse(result.questionsActuallyAttemptedIds) : []).map(qId => {
                    const fullData = questions.find(q => q.id === qId) || { id: qId, text: `Question data not found.`, options: []};
                    const userAnswers = result.userAnswersSnapshot ? JSON.parse(result.userAnswersSnapshot) : {};
                    const userAnswerId = userAnswers[qId];
                    return { ...fullData, userAnswerId, isCorrect: userAnswerId === fullData.correctOptionId };
                });

                setDetailData({ result, detailedQuestions });
            } else {
                // --- Fetch data for the list view ---
                const { data } = await apiClient.get('/api/results', authHeader);
                setHistoricalList(data || []);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch data.');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, resultId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { historicalList, detailData, isLoading, error };
};