// src/hooks/useAICenter.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useNotifications } from '../contexts/NotificationsContext'; // <-- Import hook

export const useAICenter = () => {
    const { addNotification } = useNotifications(); // <-- Use hook
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // The local 'error' state is no longer needed for display
    // const [error, setError] = useState(null); // <-- Can be removed

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

        try {
            const historyForApi = messages;
            const response = await apiClient.post('/api/ai/chat', {
                history: historyForApi,
                message: input.trim(),
            });

            const modelMessage = { role: 'model', parts: [{ text: response.data.response }] };
            setMessages(prev => [...prev, modelMessage]);

        } catch (err) {
            // --- START OF FIX: Use the new notification system ---
            const backendError = err.response?.data?.error || 'Sorry, something went wrong. Please try again.';
            
            if (backendError.toLowerCase().includes('overloaded')) {
                addNotification("The model is over-loaded. Please contact the admin or try again.", 'warning');
            } else {
                addNotification(backendError, 'error');
            }
            // We no longer need to add an error message to the chat history itself
            // --- END OF FIX ---
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, addNotification]);

    return {
        messages,
        input,
        setInput,
        isLoading,
        error: null, // This can be returned as null now
        handleSendMessage
    };
};