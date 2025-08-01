// src/contexts/TopicsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axiosInstance';

const TopicsContext = createContext({
    topics: [],
    isLoading: true,
});

export const useTopics = () => {
    return useContext(TopicsContext);
};

export const TopicsProvider = ({ children }) => {
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTopics = async () => {
            setIsLoading(true);
            try {
                // First, try to load from localStorage
                const storedTopics = localStorage.getItem('reactiquiz-topics');
                if (storedTopics) {
                    setTopics(JSON.parse(storedTopics));
                } else {
                    // If not in storage, fetch from the API
                    const { data } = await apiClient.get('/api/topics');
                    if (data && Array.isArray(data)) {
                        setTopics(data);
                        // Save to localStorage for next time
                        localStorage.setItem('reactiquiz-topics', JSON.stringify(data));
                    }
                }
            } catch (error) {
                console.error("Failed to load or parse topics:", error);
                // If anything fails, try one last fetch from the API as a fallback
                try {
                    const { data } = await apiClient.get('/api/topics');
                    setTopics(data || []);
                } catch (fetchError) {
                    console.error("Final attempt to fetch topics failed:", fetchError);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadTopics();
    }, []); // This effect runs only once when the app starts

    const value = { topics, isLoading };

    return (
        <TopicsContext.Provider value={value}>
            {children}
        </TopicsContext.Provider>
    );
};