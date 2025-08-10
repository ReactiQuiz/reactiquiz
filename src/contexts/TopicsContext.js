// src/contexts/TopicsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axiosInstance';
const TOPICS_CACHE_VERSION = 'v1';
const TOPICS_CACHE_KEY = `reactiquiz-topics-${TOPICS_CACHE_VERSION}`;

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
                // --- START OF CHANGE: Use the versioned key ---
                const storedTopics = localStorage.getItem(TOPICS_CACHE_KEY);
                // --- END OF CHANGE ---
                if (storedTopics) {
                    setTopics(JSON.parse(storedTopics));
                } else {
                    const { data } = await apiClient.get('/api/topics');
                    if (data && Array.isArray(data)) {
                        setTopics(data);
                        // --- START OF CHANGE: Use the versioned key and clear old versions ---
                        // Clear any old, unversioned or differently versioned keys
                        Object.keys(localStorage).forEach(key => {
                            if (key.startsWith('reactiquiz-topics-')) {
                                localStorage.removeItem(key);
                            }
                        });
                        localStorage.setItem(TOPICS_CACHE_KEY, JSON.stringify(data));
                        // --- END OF CHANGE ---
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