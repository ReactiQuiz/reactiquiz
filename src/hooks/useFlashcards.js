// src/hooks/useFlashcards.js
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { parseQuestionOptions, shuffleArray } from '../utils/quizUtils';

// Fetcher function that accepts the topicId
const fetchQuestionsForTopic = async (topicId) => {
  if (!topicId) return [];
  const { data } = await apiClient.get(`/api/questions?topicId=${topicId}`);
  return parseQuestionOptions(data || []);
};

export const useFlashcards = () => {
  const { topicId } = useParams();

  // --- UI State ---
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // --- Data Fetching with useQuery ---
  const { 
    data: allQuestions = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['questions', topicId], // The query key is dynamic!
    queryFn: () => fetchQuestionsForTopic(topicId),
    enabled: !!topicId, // Only run query if topicId exists
  });

  // Effect to format and shuffle cards when data is fetched
  useEffect(() => {
    if (allQuestions.length > 0) {
      const formattedForFlashcards = allQuestions.map(q => ({
        id: q.id, frontText: q.text, options: q.options,
        correctOptionId: q.correctOptionId, explanation: q.explanation,
      }));
      setFlashcards(shuffleArray([...formattedForFlashcards]));
      setCurrentCardIndex(0);
    }
  }, [allQuestions]);

  // --- Event Handlers ---
  const handleNextCard = () => {
    if (flashcards.length > 0) {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }
  };
  const handlePreviousCard = () => {
    if (flashcards.length > 0) {
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    }
  };
  const handleShuffleCards = () => {
    if (allQuestions.length > 0) {
        handleShuffleCards(); // Re-use the effect logic
    }
  };

  const currentCardData = useMemo(() => {
    return flashcards.length > 0 ? flashcards[currentCardIndex] : null;
  }, [flashcards, currentCardIndex]);

  return {
    topicId, allQuestions, flashcards, currentCardIndex, isLoading,
    error: isError ? error.message : null,
    currentCardData, handleNextCard, handlePreviousCard, handleShuffleCards,
  };
};