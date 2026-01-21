// src/hooks/useAICenter.ts
/**
 * AI Center Hook
 * 
 * This hook manages the AI chat interface state and message handling
 * for the AI Center page, where users can interact with Q, the study assistant.
 */
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useNotifications } from '../contexts/NotificationsContext';
import { UseAICenterReturn } from '../types';

/**
 * Message Interface
 * 
 * Structure for chat messages in the AI conversation.
 * Messages can be from the user or the AI model (assistant).
 */
interface Message {
    role: 'user' | 'model' | 'assistant'; // Message sender role
    parts: Array<{ text: string }>; // Message content parts (text blocks)
    isError?: boolean; // Optional flag indicating if message is an error
}

/**
 * useAICenter Hook
 * 
 * Custom hook that manages the AI chat interface state, message history,
 * and handles sending messages to the AI assistant. Initializes with a
 * welcome message from the AI assistant.
 * 
 * @returns {UseAICenterReturn} Messages, input state, loading state, and message handler
 */
export const useAICenter = (): UseAICenterReturn => {
    // Notification context for displaying errors and warnings
    const { addNotification } = useNotifications();
    // State for chat message history
    const [messages, setMessages] = useState<Array<{
        role: 'user' | 'assistant' | 'model'; // Message sender role
        parts: Array<{ text: string }>; // Message content parts
        isError?: boolean; // Optional error flag
    }>>([]);
    // State for user input in the chat input field
    const [input, setInput] = useState<string>('');
    // State for loading indicator during AI response
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * Initialize Welcome Message Effect
     * 
     * Sets up the initial welcome message from the AI assistant (Q)
     * when the component first mounts. This provides a friendly greeting
     * to users when they first open the AI Center.
     */
    useEffect(() => {
        setMessages([
            {
                role: 'model',
                parts: [{ text: "Hello! I'm Q, your personal study assistant. How can I help you prepare for your exams or analyze your results today?" }]
            }
        ]);
    }, []);

    /**
     * Handle Send Message
     * 
     * Handles sending a message to the AI assistant. This function:
     * 1. Prevents default form submission
     * 2. Validates input (must be non-empty and not already loading)
     * 3. Adds user message to chat history
     * 4. Sends message and history to API
     * 5. Adds AI response to chat history
     * 6. Handles errors with notifications
     * 
     * @param {React.FormEvent} e - Form event (optional, can be undefined)
     */
    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        // Prevent default form submission if event exists
        if (e) e.preventDefault();
        // Don't send if input is empty or already loading
        if (!input.trim() || isLoading) return;

        // Create user message object
        const userMessage: Message = { role: 'user', parts: [{ text: input }] };
        // Add user message to history
        const currentHistory: Message[] = [...messages, userMessage];
        
        // Update messages with user message (optimistic update)
        setMessages(currentHistory);
        // Clear input field
        setInput('');
        // Set loading state
        setIsLoading(true);

        try {
            // Prepare history for API (can be modified if needed)
            const historyForApi = currentHistory;
            // Send message to AI API endpoint
            const response = await apiClient.post('/api/ai/chat', {
                history: historyForApi,
                message: input.trim(),
            });

            // Create model response message
            const modelMessage: Message = { role: 'model', parts: [{ text: response.data.response }] };
            // Add model response to message history
            setMessages((prev: Message[]) => [...prev, modelMessage]);

        } catch (err: any) {
            // Extract error message from response or use default
            const backendError = err.response?.data?.error || 'Sorry, something went wrong. Please try again.';
            
            // Handle special case for overloaded model
            if (backendError.toLowerCase().includes('overloaded')) {
                addNotification("The model is over-loaded. Please contact the admin or try again.", 'warning');
            } else {
                // Show general error notification
                addNotification(backendError, 'error');
            }
            // Errors are now handled via notifications, not added to chat history
        } finally {
            // Always stop loading regardless of success or failure
            setIsLoading(false);
        }
    }, [input, isLoading, messages, addNotification]);

    return {
        messages,
        input,
        setInput,
        isLoading,
        error: null, // Errors are handled via notifications now
        handleSendMessage
    };
};