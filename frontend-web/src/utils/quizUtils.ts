// src/utils/quizUtils.ts
/**
 * Quiz Utilities
 * 
 * This file provides utility functions for quiz-related operations,
 * including question parsing, array shuffling, score calculation,
 * time formatting, and quiz session validation.
 */
import { Question } from '../types';

/**
 * Parse Question Options
 * 
 * A robust function to parse the 'options' field of question objects within an array.
 * It handles cases where 'options' is a JSON string or already an array.
 * Normalizes all options to the standard format: { id: string, text: string }
 * 
 * Processing flow:
 * 1. Validates input is an array
 * 2. If options is already an array, normalizes to {id, text} format
 * 3. If options is a JSON string, parses and normalizes
 * 4. Handles invalid/missing options gracefully
 * 5. Returns array with all options in consistent format
 * 
 * @param {Question[]} questionsArray - An array of question objects
 * @returns {Question[]} The array of question objects with 'options' guaranteed to be arrays
 */
export const parseQuestionOptions = (questionsArray: Question[]): Question[] => {
  if (!Array.isArray(questionsArray)) {
    console.warn("[quizUtils] Invalid input: expected an array of questions.", questionsArray);
    return [];
  }

  return questionsArray.map(q => {
    // Pass through any invalid items in the array to avoid crashes
    if (!q || typeof q !== 'object') {
      console.warn("[quizUtils] Encountered invalid item in questionsArray:", q);
      return q;
    }

    // If options are already a valid array, coerce each option into { id, text } shape.
    if (Array.isArray(q.options)) {
      const normalized = q.options.map((opt: any, idx: number) => {
        if (opt && typeof opt === 'object' && 'id' in opt && 'text' in opt) return opt;
        if (typeof opt === 'string') return { id: String.fromCharCode(65 + idx), text: opt };
        return { id: String.fromCharCode(65 + idx), text: String(opt ?? '') };
      });
      return { ...q, options: normalized } as Question;
    }

    // If options are a string, attempt to parse them.
    if (typeof q.options === 'string') {
      try {
        const parsedOptions = JSON.parse(q.options);
        if (Array.isArray(parsedOptions)) {
          // Success: return the question with the parsed and normalized options array.
          const normalized = parsedOptions.map((opt: any, idx: number) => {
            if (opt && typeof opt === 'object' && 'id' in opt && 'text' in opt) return opt;
            if (typeof opt === 'string') return { id: String.fromCharCode(65 + idx), text: opt };
            return { id: String.fromCharCode(65 + idx), text: String(opt ?? '') };
          });
          return { ...q, options: normalized } as Question;
        } else {
          // The string was valid JSON but not an array.
          console.warn(`[quizUtils] Parsed 'options' for question ${q.id} is not an array.`, parsedOptions);
          return { ...q, options: [] };
        }
      } catch (error) {
        // The string was invalid JSON.
        console.error(`[quizUtils] Failed to parse 'options' JSON string for question ${q.id}:`, q.options, error);
        return { ...q, options: [] };
      }
    }

    // Handle cases where options are missing, null, or another invalid type.
    console.warn(`[quizUtils] 'options' field for question ${q.id} is invalid or missing.`, q);
    return { ...q, options: [] } as Question;
  });
};


/**
 * Shuffle Array
 * 
 * Shuffles an array using the Fisher-Yates shuffle algorithm.
 * Creates a new array to avoid mutating the original.
 * 
 * @template T - Type of array elements
 * @param {T[]} array - The array to shuffle
 * @returns {T[]} A new shuffled array (original array is not modified)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array]; // Create a copy to avoid mutating the original
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
};

/**
 * Calculate Score Percentage
 * 
 * Calculates the score percentage based on correct answers and total questions.
 * Returns 0 if totalQuestions is 0 to avoid division by zero.
 * 
 * @param {number} correctAnswers - Number of correct answers
 * @param {number} totalQuestions - Total number of questions
 * @returns {number} The percentage score (0-100), rounded to nearest integer
 */
export const calculateScorePercentage = (correctAnswers: number, totalQuestions: number): number => {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
};

/**
 * Format Time (MM:SS)
 * 
 * Formats time in seconds to a readable string in MM:SS format.
 * Pads minutes and seconds with leading zeros for consistent display.
 * 
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string in MM:SS format (e.g., "05:30")
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Is Quiz Session Active
 * 
 * Validates if a quiz session is still active based on time limit.
 * Calculates elapsed time from start time and compares with time limit.
 * 
 * @param {string} startTime - Start time of the quiz (ISO date string)
 * @param {number} timeLimit - Time limit in minutes
 * @returns {boolean} True if quiz is still active (elapsed time < limit), false otherwise
 */
export const isQuizSessionActive = (startTime: string, timeLimit: number): boolean => {
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  const elapsedMinutes = (now - start) / (1000 * 60);
  return elapsedMinutes < timeLimit;
};

/**
 * Format Display Topic Name
 * 
 * Formats the display name for a topic depending on context.
 * Handles challenge quizzes vs normal quizzes with different naming logic.
 * 
 * @param {string | number | null | undefined} [topicId] - Topic identifier
 * @param {string | null | undefined} [fallbackTopicName] - Fallback topic name
 * @param {boolean} [isChallenge] - Whether this is a challenge quiz
 * @param {any} [challengeDetails] - Challenge-specific details with topic_name
 * @returns {string} Formatted topic display name
 */
export const formatDisplayTopicName = (
  topicId?: string | number | null,
  fallbackTopicName?: string | null,
  isChallenge?: boolean,
  challengeDetails?: any
): string => {
  if (isChallenge && challengeDetails) {
    return challengeDetails.topic_name || fallbackTopicName || String(topicId || 'Unknown Topic');
  }
  return fallbackTopicName || String(topicId || 'Unknown Topic');
};