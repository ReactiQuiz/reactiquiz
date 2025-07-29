// src/hooks/useFlashcards.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { parseQuestionOptions, shuffleArray } from '../utils/quizUtils';

const fetchQuestionsForTopic = async (topicId) => {
  if (!topicId) return [];
  const { data } = await apiClient.get(`/api/questions?topicId=${topicId}`);
  return parseQuestionOptions(data || []);
};

export const useFlashcards = () => {
  const { topicId } = useParams();

  const [allQuestions, setAllQuestions] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const { isLoading, isError, error } = useQuery({
    queryKey: ['questions', topicId],
    queryFn: () => fetchQuestionsForTopic(topicId),
    enabled: !!topicId,
  });

  useEffect(() => {
    if (isError || isLoading) return;
    setAllQuestions(fetchedQuestions);
    const formatted = fetchedQuestions.map(q => ({
      id: q.id, frontText: q.text, options: q.options,
      correctOptionId: q.correctOptionId, explanation: q.explanation,
    }));
    setFlashcards(shuffleArray([...formatted]));
    setCurrentCardIndex(0);
  }, [fetchedQuestions, isLoading, isError]);
  
  const fetchedQuestions = useQuery({
    queryKey: ['questions', topicId],
    queryFn: () => fetchQuestionsForTopic(topicId),
    enabled: !!topicId,
  }).data || [];

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

  // --- START OF FIX: Corrected shuffle logic ---
  const handleShuffleCards = useCallback(() => {
    if (allQuestions.length > 0) {
      const formattedForFlashcards = allQuestions.map(q => ({
        id: q.id,
        frontText: q.text,
        options: q.options,
        correctOptionId: q.correctOptionId,
        explanation: q.explanation,
      }));
      setFlashcards(shuffleArray([...formattedForFlashcards]));
      setCurrentCardIndex(0); // Reset to the first card
    }
  }, [allQuestions]);
  // --- END OF FIX ---

  const currentCardData = useMemo(() => {
    return flashcards.length > 0 ? flashcards[currentCardIndex] : null;
  }, [flashcards, currentCardIndex]);

  return {
    topicId, allQuestions, flashcards, currentCardIndex, isLoading,
    error: isError ? error.message : null,
    currentCardData, handleNextCard, handlePreviousCard, handleShuffleCards,
  };
};