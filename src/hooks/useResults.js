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
            // The axios interceptor automatically adds the auth token.
            
            if (resultId) {
                // --- Fetch data for a SINGLE detailed view ---
                const { data: allResults } = await apiClient.get('/api/results');
                const result = allResults.find(r => String(r.id) === String(resultId));

                if (!result) {
                    throw new Error("Result not found or you don't have permission to view it.");
                }

                const { data: allQuestionsForTopic } = await apiClient.get(`/api/questions?topicId=${result.topicId}`);
                
                // --- START OF FIX: Parse JSON strings from the database response ---
                const attemptedQuestionIds = result.questionsActuallyAttemptedIds ? JSON.parse(result.questionsActuallyAttemptedIds) : [];
                const userAnswers = result.userAnswersSnapshot ? JSON.parse(result.userAnswersSnapshot) : {};
                // --- END OF FIX ---

                const detailedQuestions = attemptedQuestionIds.map(qId => {
                    const fullQuestionData = allQuestionsForTopic.find(q => q.id === qId) || { id: qId, text: `Question data not found.`, options: [] };
                    const userAnswerId = userAnswers[qId]; // This will now be correct (e.g., 'a', 'b') or undefined
                    
                    return {
                        ...fullQuestionData,
                        userAnswerId: userAnswerId,
                        isCorrect: userAnswerId === fullQuestionData.correctOptionId,
                        isAnswered: userAnswerId != null // Check for null or undefined
                    };
                });

                setDetailData({ result, detailedQuestions });

            } else {
                // --- Fetch data for the LIST view ---
                const { data } = await apiClient.get('/api/results');
                setHistoricalList(data || []);
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