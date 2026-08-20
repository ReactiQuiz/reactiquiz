// api/_utils/arrayUtils.js
/**
 * Array Utility Functions
 * 
 * Provides utility functions for array manipulation operations
 * used throughout the API.
 */

/**
 * Shuffle Array
 * 
 * Shuffles an array using the Fisher-Yates algorithm.
 * Returns an empty array if the input is invalid or not an array.
 * 
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array (original array is not modified)
 */
const shuffleArray = (array) => {
  if (!array || !Array.isArray(array)) return [];
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }
  return shuffled;
};

module.exports = { shuffleArray };