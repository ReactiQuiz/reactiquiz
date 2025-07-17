// src/hooks/useAICenter.js
import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../api/axiosInstance';

export const useAICenter = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Add an initial greeting from the AI
    useEffect(() => {
        setMessages([
            {
                role: 'model',
                parts: [{ text: "Hello! I'm Q, your personal study assistant. How can I help you prepare for your exams or analyze your results today?" }]
            }
        ]);
    }, []);

    const handleSendMessage = useCallback(async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', parts: [{ text: input }] };
        const currentHistory = [...messages, userMessage];
        
        setMessages(currentHistory);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            // We only need to send the history *before* the user's latest message
            const historyForApi = messages;
            const response = await apiClient.post('/api/ai/chat', {
                history: historyForApi,
                message: input.trim(),
            });

            const modelMessage = { role: 'model', parts: [{ text: response.data.response }] };
            setMessages(prev => [...prev, modelMessage]);

        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Sorry, something went wrong. Please try again.';
            setError(errorMessage);
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: errorMessage }], isError: true }]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages]);

    return {
        messages,
        input,
        setInput,
        isLoading,
        error,
        handleSendMessage
    };
};