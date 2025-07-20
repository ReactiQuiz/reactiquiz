// src/hooks/useResults.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

export const useResults = () => {
    const { currentUser } = useAuth();
    const [historicalList, setHistoricalList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchHistoricalList = useCallback(async () => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('reactiquizToken');
            const response = await apiClient.get('/api/results', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistoricalList(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch quiz history.');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchHistoricalList();
    }, [fetchHistoricalList]);

    return { historicalList, isLoading, error };
};