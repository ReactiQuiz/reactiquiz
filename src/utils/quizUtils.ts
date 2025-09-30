// src/utils/quizUtils.ts

/**
 * Parses the 'options' field of question objects within an array.
 * If 'options' is a JSON string, it's parsed into an array.
 * If it's already an array, it's returned as is.
 * Handles potential parsing errors.
 * @param questionsArray - An array of question objects.
 * @returns The array of question objects with 'options' as arrays.
 */
export const parseQuestionOptions = (questionsArray: any[]): any[] => {
  if (!Array.isArray(questionsArray)) {
    console.warn("[quizUtils] parseQuestionOptions received non-array input:", questionsArray);
    return [];
  }
  return questionsArray.map(q => {
    if (!q || typeof q !== 'object') {
        console.warn("[quizUtils] Encountered invalid item in questionsArray:", q);
        return q;
    }
    if (q.options === undefined || q.options === null) {
        console.warn("[quizUtils] Question missing 'options' field:", q);
        return q;
    }
    if (Array.isArray(q.options)) {
        return { ...q, options: q.options };
    }
    if (typeof q.options === 'string') {
        try {
            const parsed = JSON.parse(q.options);
            if (Array.isArray(parsed)) {
                return { ...q, options: parsed };
            } else {
                console.warn("[quizUtils] Parsed 'options' is not an array:", parsed);
                return { ...q, options: [] };
            }
        } catch (error) {
            console.warn("[quizUtils] Failed to parse 'options' JSON string:", error);
            return { ...q, options: [] };
        }
    }
    console.warn("[quizUtils] 'options' field is neither array nor string:", q.options);
    return { ...q, options: [] };
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
