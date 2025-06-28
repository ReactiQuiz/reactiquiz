// src/hooks/useFlashcards.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/axiosInstance';
import { parseQuestionOptions, shuffleArray } from '../utils/quizUtils';

/**
 * A custom hook to manage all state and logic for the FlashcardPage.
 * @returns {object} An object containing all the state, derived data, and handlers needed by the FlashcardPage component.
 */
export const useFlashcards = () => {
  const { topicId } = useParams();

  // --- State Management ---
  const [allQuestions, setAllQuestions] = useState([]); // Source of truth for all fetched questions
  const [flashcards, setFlashcards] = useState([]); // The shuffled list for display
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Data Fetching Logic ---
  const fetchQuestionsForFlashcards = useCallback(async () => {
    if (!topicId) {
      setError("Topic ID is missing.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/api/questions?topicId=${topicId}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const questionsWithParsedOptions = parseQuestionOptions(response.data);
        setAllQuestions(questionsWithParsedOptions); // Store the source questions

        // Format and shuffle the initial set of flashcards
        const formattedForFlashcards = questionsWithParsedOptions.map(q => ({
          id: q.id,
          frontText: q.text,
          options: q.options,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation,
        }));
        setFlashcards(shuffleArray([...formattedForFlashcards]));
        setCurrentCardIndex(0);
      } else {
        setError('No questions found for this topic to create flashcards.');
        setAllQuestions([]);
        setFlashcards([]);
      }
    } catch (err) {
      setError(`Failed to load questions: ${err.response?.data?.message || err.message}`);
      setAllQuestions([]);
      setFlashcards([]);
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchQuestionsForFlashcards();
  }, [fetchQuestionsForFlashcards]);

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
      const formattedForFlashcards = allQuestions.map(q => ({
        id: q.id,
        frontText: q.text,
        options: q.options,
        correctOptionId: q.correctOptionId,
        explanation: q.explanation,
      }));
      setFlashcards(shuffleArray([...formattedForFlashcards]));
      setCurrentCardIndex(0);
    }
  };

  // --- Memoized Derived State ---
  const currentCardData = useMemo(() => {
    return flashcards.length > 0 ? flashcards[currentCardIndex] : null;
  }, [flashcards, currentCardIndex]);

  // --- Return all state and handlers ---
  return {
    topicId,
    allQuestions,
    flashcards,
    currentCardIndex,
    isLoading,
    error,
    currentCardData,
    handleNextCard,
    handlePreviousCard,
    handleShuffleCards,
  };
};