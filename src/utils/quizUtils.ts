// src/utils/quizUtils.ts

/**
 * Parses the 'options' field of question objects within an array.
 * If 'options' is a JSON string, it's parsed into an array.
 * If it's already an array, it's returned as is.
 * Handles potential parsing errors.
 * @param input - Can be an array of question objects, or a pre-parsed array of options.
 * @returns The processed array.
 */
export const parseQuestionOptions = (input: any): any[] => {
  // 1. Handle non-array inputs first (e.g., JSON strings or null/undefined)
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("[quizUtils] Failed to parse options JSON string:", error);
      return [];
    }
  }

  if (!Array.isArray(input)) {
    // Return empty array for any other non-array types like null, undefined, or single objects.
    return [];
  }

  // 2. Handle array inputs
  // Heuristic: If the first element has a topicId, we assume it's an array of questions.
  const isQuestionArray = input.length > 0 && input[0] && typeof input[0] === 'object' && input[0].topicId !== undefined;

  if (isQuestionArray) {
    // Process an array of questions, parsing the 'options' field of each.
    return input.map(q => {
      if (!q || typeof q !== 'object') {
        return q; // Should not happen in a valid question array but good for safety
      }
      let parsedOptions: any[] = [];
      if (Array.isArray(q.options)) {
        parsedOptions = q.options;
      } else if (typeof q.options === 'string') {
        try {
          const parsed = JSON.parse(q.options);
          if (Array.isArray(parsed)) {
            parsedOptions = parsed;
          }
        } catch (e) {
          console.error(`[quizUtils] Failed to parse options for question ${q.id}`);
        }
      }
      return { ...q, options: parsedOptions };
    });
  } else {
    // Otherwise, assume it's already a parsed array of options (or an empty/malformed array) and return it as-is.
    // This correctly handles the case from useQuiz.ts.
    return input;
  }
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