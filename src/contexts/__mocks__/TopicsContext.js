// src/contexts/__mocks__/TopicsContext.js

import React, { createContext, useContext } from 'react';

// Create a mock context with default values
const MockTopicsContext = createContext({
  topics: [{ id: 'mock-topic', name: 'Mock Topic from Context' }], // Provide some mock data
  isLoading: false,
});

// Mock the useTopics hook
export const useTopics = () => {
  return useContext(MockTopicsContext);
};

// Mock the TopicsProvider to just render its children
export const TopicsProvider = ({ children }) => {
  const value = {
    topics: [{ id: 'mock-topic', name: 'Mock Topic from Context' }],
    isLoading: false,
  };
  return (
    <MockTopicsContext.Provider value={value}>
      {children}
    </MockTopicsContext.Provider>
  );
};