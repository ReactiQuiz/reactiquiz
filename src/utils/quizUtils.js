// src/utils/quizUtils.js

/**
 * Parses the 'options' field of question objects within an array.
 * If 'options' is a JSON string, it's parsed into an array.
 * If it's already an array, it's returned as is.
 * Handles potential parsing errors.
 * @param {Array<Object>} questionsArray - An array of question objects.
 * @returns {Array<Object>} The array of question objects with 'options' as arrays.
 */
export const parseQuestionOptions = (questionsArray) => {
  if (!Array.isArray(questionsArray)) {
    console.warn("[quizUtils] parseQuestionOptions received non-array input:", questionsArray);
    return [];
  }
  return questionsArray.map(q => {
    if (!q || typeof q !== 'object') {
        console.warn("[quizUtils] Encountered invalid item in questionsArray:", q);
        return q;
    }
    let parsedOptions = [];
    if (typeof q.options === 'string') {
      try {
        parsedOptions = JSON.parse(q.options);
        if (!Array.isArray(parsedOptions)) {
            console.warn(`[quizUtils] Parsed options for Q ID ${q.id} is not an array:`, parsedOptions);
            parsedOptions = [];
        }
      } catch (e) {
        console.error(`[quizUtils] Failed to parse options for question ID ${q.id}:`, q.options, e);
      }
    } else if (Array.isArray(q.options)) {
      parsedOptions = q.options;
    } else if (q.options !== undefined && q.options !== null) {
      console.warn(`[quizUtils] Question ID ${q.id} has unexpected options format (not string or array):`, q.options);
    }
    return { ...q, options: parsedOptions };
  });
};

/**
 * Formats a topic name for display based on its ID and other optional details.
 * @param {string} topicId - The ID of the topic.
 * @param {string|null} topicNameFromState - A pre-formatted name, if available.
 * @param {boolean} isChallenge - Whether this is for a challenge result.
 * @param {Object|null} challengeDetails - Details of the challenge, if applicable.
 * @returns {string} The formatted topic name.
 */
export const formatDisplayTopicName = (topicId, topicNameFromState = null, isChallenge = false, challengeDetails = null) => {
  // ... (your existing formatDisplayTopicName logic from previous step)
  if (isChallenge && challengeDetails?.topic_name) return `Challenge: ${challengeDetails.topic_name}`;
  if (isChallenge && topicNameFromState) return `Challenge: ${topicNameFromState}`;
  if (isChallenge) return `Challenge: ${topicId ? String(topicId).replace(/-/g, ' ') : 'Quiz'}`;
  if (topicNameFromState && topicId && topicNameFromState !== String(topicId).replace(/-/g, ' ')) { return topicNameFromState; }
  if (!topicId) return 'N/A';
  let name = String(topicId).replace(/-/g, ' ');
  name = name.replace(/^homibhabha practice /i, 'Homi Bhabha Practice - ');
  name = name.replace(/^pyq /i, 'PYQ ');
  const classSuffixRegex = /\s(\d+(?:st|nd|rd|th))$/i;
  name = name.replace(classSuffixRegex, (match, p1) => ` - Class ${p1.toUpperCase()}`).trim();
  name = name.split(' ').map(word => {
    if (word.toLowerCase() === 'class' || word.toLowerCase() === 'std') return word;
    if (word.includes('-')) { return word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-'); }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); }).join(' ');
  name = name.replace(/Homi Bhabha Practice - (\w+) (\w+)/i, (match, quizClass, difficulty) => `Homi Bhabha Practice - Std ${quizClass} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`);
  name = name.replace(/Pyq (\w+) (\d+)/i, (match, quizClass, year) => `PYQ - Std ${quizClass} (${year})`);
  name = name.replace(/Pyq - Class (\w+) \((\d+)\)/i, (match, quizClass, year) => `PYQ - Std ${quizClass} (${year})`);
  return name;
};

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} The shuffled array (same instance, modified in place, but also returned).
 */
export const shuffleArray = (array) => {
  if (!array || !Array.isArray(array)) return [];
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array; // Returns the same array instance, now shuffled
};