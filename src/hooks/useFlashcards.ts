// src/hooks/useFlashcards.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { parseQuestionOptions, shuffleArray } from '../utils/quizUtils';
import { Question } from '../types';
import { UseFlashcardsReturn } from '../types';

// Fetcher function remains outside the hook
const fetchQuestionsForTopic = async (topicId: string): Promise<Question[]> => {
  if (!topicId) return [];
  const { data } = await apiClient.get(`/api/questions?topicId=${topicId}`);
  return parseQuestionOptions(data || []);
};

export const useFlashcards = (): UseFlashcardsReturn => {
  const { topicId } = useParams<{ topicId: string }>();

  // Local state for the shuffled deck and the current card index
  const [flashcards, setFlashcards] = useState<Question[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);

  // --- START OF THE ROBUST FIX ---

  // 1. Call useQuery once to fetch the master list of questions.
  // We alias 'data' to 'fetchedQuestions' for clarity.
  const { 
    data: fetchedQuestions = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery<Question[]>({
    queryKey: ['questions', topicId],
    queryFn: () => fetchQuestionsForTopic(topicId!),
    enabled: !!topicId,
  });

  // 2. Use a useEffect to process the data *after* it has been successfully fetched.
  // This hook now correctly depends on `fetchedQuestions`.
  useEffect(() => {
    // Only proceed if data is available
    if (fetchedQuestions && fetchedQuestions.length > 0) {
      // Format the raw questions into the structure needed for flashcards
      const formatted = fetchedQuestions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || '',
        difficulty: q.difficulty,
        marks: q.marks,
        topicId: q.topicId,
        createdAt: q.createdAt || '',
      }));
      // Create the initial shuffled deck and set it to state
      setFlashcards(shuffleArray([...formatted]));
      setCurrentCardIndex(0); // Reset to the first card
    }
  }, [fetchedQuestions]); // This effect re-runs ONLY when fetchedQuestions changes

  // 3. The shuffle handler now uses the stable `fetchedQuestions` as its source.
  const handleShuffleCards = useCallback(() => {
    if (fetchedQuestions && fetchedQuestions.length > 0) {
      const formatted = fetchedQuestions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || '',
        difficulty: q.difficulty,
        marks: q.marks,
        topicId: q.topicId,
        createdAt: q.createdAt || '',
      }));
      setFlashcards(shuffleArray([...formatted]));
      setCurrentCardIndex(0);
    }
  }, [fetchedQuestions]);

  // --- END OF THE ROBUST FIX ---

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

  // currentCardData was unused; removed to satisfy linter

  return {
    topicId: topicId || '',
    flashcards, // The component now only needs the shuffled deck
    currentCardIndex,
    isLoading,
    error: isError ? (error as Error)?.message || 'An error occurred' : null,
    handleNextCard,
    handlePreviousCard,
    handleShuffleCards,
  };
};