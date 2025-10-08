// src/utils/quizUtils.ts
import { Question } from '../types';

/**
 * A robust function to parse the 'options' field of question objects within an array.
 * It handles cases where 'options' is a JSON string or already an array.
 * @param questionsArray - An array of question objects.
 * @returns The array of question objects with 'options' guaranteed to be arrays.
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
 * Shuffles an array using the Fisher-Yates algorithm.
 * @param array - The array to shuffle.
 * @returns A new shuffled array (original array is not modified).
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
 * Calculates the score percentage based on correct answers and total questions.
 * @param correctAnswers - Number of correct answers.
 * @param totalQuestions - Total number of questions.
 * @returns The percentage score (0-100).
 */
export const calculateScorePercentage = (correctAnswers: number, totalQuestions: number): number => {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
};

/**
 * Formats time in seconds to a readable string (MM:SS).
 * @param seconds - Time in seconds.
 * @returns Formatted time string.
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Validates if a quiz session is still active based on time limit.
 * @param startTime - Start time of the quiz.
 * @param timeLimit - Time limit in minutes.
 * @returns True if quiz is still active, false otherwise.
 */
export const isQuizSessionActive = (startTime: string, timeLimit: number): boolean => {
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  const elapsedMinutes = (now - start) / (1000 * 60);
  return elapsedMinutes < timeLimit;
};

/**
 * Formats display topic name depending on context (challenge vs normal quiz).
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