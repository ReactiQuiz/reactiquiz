// src/hooks/useFlashcards.ts
/**
 * Flashcards Hook
 * 
 * This hook manages flashcard state and logic for the flashcard study mode.
 * It fetches questions for a topic, creates a shuffled deck, and provides
 * navigation through the flashcards.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosInstance';
import { parseQuestionOptions, shuffleArray } from '../utils/quizUtils';
import { Question } from '../types';
import { UseFlashcardsReturn } from '../types';

/**
 * Fetch Questions For Topic
 * 
 * Fetches questions for a specific topic from the API and parses them
 * into the format needed for flashcards. This function is kept outside
 * the hook to maintain referential stability.
 * 
 * @param {string} topicId - The topic ID to fetch questions for
 * @returns {Promise<Question[]>} Promise that resolves to an array of questions
 */
const fetchQuestionsForTopic = async (topicId: string): Promise<Question[]> => {
  // Early return if topicId is not provided
  if (!topicId) return [];
  // Fetch questions from API
  const { data } = await apiClient.get(`/api/questions?topicId=${topicId}`);
  // Parse question options (convert JSON strings to objects) and return
  return parseQuestionOptions(data || []);
};

/**
 * useFlashcards Hook
 * 
 * Custom hook that manages flashcard functionality for studying questions.
 * Fetches questions for a topic, creates a shuffled deck, and provides navigation
 * through the flashcards. Uses React Query for data fetching and manages local
 * state for the shuffled deck and current position.
 * 
 * @returns {UseFlashcardsReturn} Flashcards deck, current index, loading state, and navigation handlers
 */
export const useFlashcards = (): UseFlashcardsReturn => {
  // Get topicId from URL parameters
  const { topicId } = useParams<{ topicId: string }>();

  // Local state for the shuffled deck of flashcards
  const [flashcards, setFlashcards] = useState<Question[]>([]);
  // Local state for the current card index (position in the deck)
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);

  // --- START OF THE ROBUST FIX ---
  // This approach separates data fetching from deck management for better reliability

  /**
   * Fetch Questions Query
   * 
   * Uses React Query to fetch questions for the current topic.
   * The query is only enabled when topicId is available.
   * Data is aliased to 'fetchedQuestions' for clarity.
   */
  const { 
    data: fetchedQuestions = [], // Master list of questions from API
    isLoading, // Loading state from React Query
    isError, // Error state from React Query
    error // Error object from React Query
  } = useQuery<Question[]>({
    queryKey: ['questions', topicId], // Cache key includes topicId for proper caching
    queryFn: () => fetchQuestionsForTopic(topicId!), // Fetch function
    enabled: !!topicId, // Only fetch if topicId exists
  });

  /**
   * Process Questions Effect
   * 
   * Processes fetched questions into flashcard format and creates
   * the initial shuffled deck. This effect runs whenever fetchedQuestions
   * changes, ensuring the deck is updated when new data arrives.
   */
  useEffect(() => {
    // Only proceed if data is available
    if (fetchedQuestions && fetchedQuestions.length > 0) {
      // Format the raw questions into the structure needed for flashcards
      const formatted = fetchedQuestions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || '', // Default to empty string if no explanation
        difficulty: q.difficulty,
        marks: q.marks,
        topicId: q.topicId,
        createdAt: q.createdAt || '', // Default to empty string if no creation date
      }));
      // Create the initial shuffled deck and set it to state
      setFlashcards(shuffleArray([...formatted]));
      setCurrentCardIndex(0); // Reset to the first card
    }
  }, [fetchedQuestions]); // This effect re-runs ONLY when fetchedQuestions changes

  /**
   * Handle Shuffle Cards
   * 
   * Re-shuffles the flashcard deck using the original fetched questions.
   * This allows users to reshuffle the deck at any time without refetching.
   * Uses useCallback to maintain referential stability.
   */
  const handleShuffleCards = useCallback(() => {
    if (fetchedQuestions && fetchedQuestions.length > 0) {
      // Format questions into flashcard structure
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
      // Shuffle and update the deck
      setFlashcards(shuffleArray([...formatted]));
      setCurrentCardIndex(0); // Reset to first card after shuffle
    }
  }, [fetchedQuestions]);

  // --- END OF THE ROBUST FIX ---

  /**
   * Handle Next Card
   * 
   * Advances to the next card in the deck. If at the last card,
   * wraps around to the first card (circular navigation).
   */
  const handleNextCard = () => {
    if (flashcards.length > 0) {
      // Increment index, wrapping to 0 if past the end
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }
  };

  /**
   * Handle Previous Card
   * 
   * Goes back to the previous card in the deck. If at the first card,
   * wraps around to the last card (circular navigation).
   */
  const handlePreviousCard = () => {
    if (flashcards.length > 0) {
      // Decrement index, wrapping to last card if before 0
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    }
  };

  return {
    topicId: topicId || '', // Current topic ID from URL
    flashcards, // The shuffled deck of flashcards
    currentCardIndex, // Current position in the deck
    isLoading, // Loading state from React Query
    error: isError ? (error as Error)?.message || 'An error occurred' : null, // Error message or null
    handleNextCard, // Navigate to next card
    handlePreviousCard, // Navigate to previous card
    handleShuffleCards, // Reshuffle the deck
  };
};