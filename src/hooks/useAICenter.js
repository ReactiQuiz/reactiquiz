// src/hooks/useAICenter.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';

export const useAICenter = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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
            const historyForApi = messages;
            const response = await apiClient.post('/api/ai/chat', {
                history: historyForApi,
                message: input.trim(),
            });

            const modelMessage = { role: 'model', parts: [{ text: response.data.response }] };
            setMessages(prev => [...prev, modelMessage]);

        } catch (err) {
            // --- START OF FIX: Custom Error Message Handling ---
            // Get the error message sent from our backend.
            const backendError = err.response?.data?.error || 'Sorry, something went wrong. Please try again.';
            
            // Check if the backend error indicates an overload.
            if (backendError.toLowerCase().includes('overloaded')) {
                // If it is, set the error state to the specific message you requested.
                const userFriendlyError = "The model is over-loaded. Please contact the admin or try again.";
                setError(userFriendlyError);
                setMessages(prev => [...prev, { role: 'model', parts: [{ text: userFriendlyError }], isError: true }]);
            } else {
                // For all other errors, use the message from the backend directly.
                setError(backendError);
                setMessages(prev => [...prev, { role: 'model', parts: [{ text: backendError }], isError: true }]);
            }
            // --- END OF FIX ---
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