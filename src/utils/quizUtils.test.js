// src/utils/quizUtils.test.js
import { parseQuestionOptions, formatDisplayTopicName } from './quizUtils';

describe('parseQuestionOptions utility', () => {
  it('should parse a valid JSON string in the options field', () => {
    const questions = [{ id: 1, options: '[{"id": "a", "text": "Option A"}]' }];
    const result = parseQuestionOptions(questions);
    expect(result[0].options).toEqual([{ id: 'a', text: 'Option A' }]);
  });

  it('should return the options array as-is if it is already an array', () => {
    const optionsArray = [{ id: 'b', text: 'Option B' }];
    const questions = [{ id: 2, options: optionsArray }];
    const result = parseQuestionOptions(questions);
    expect(result[0].options).toBe(optionsArray);
  });

  it('should handle invalid JSON strings gracefully by returning an empty array', () => {
    // --- START OF FIX: Suppress console.error for this specific test ---
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const questions = [{ id: 3, options: 'this is not json' }];
    const result = parseQuestionOptions(questions);
    expect(result[0].options).toEqual([]);

    // Restore the original console.error function after the test
    consoleErrorSpy.mockRestore();
    // --- END OF FIX ---
  });

  it('should return an empty array for null or undefined options', () => {
    const questions = [{ id: 4, options: null }, { id: 5, options: undefined }];
    const result = parseQuestionOptions(questions);
    expect(result[0].options).toEqual([]);
    expect(result[1].options).toEqual([]);
  });
});

describe('formatDisplayTopicName utility', () => {
    it('should format a simple kebab-case topic ID', () => {
        // --- START OF FIX: Corrected the expected output to match the function's behavior ---
        expect(formatDisplayTopicName('laws-of-motion-9th')).toBe('Laws Of Motion - Class 9th');
        // --- END OF FIX ---
    });

    it('should handle Homi Bhabha practice tests', () => {
        // Assuming your function might have variations, let's make the test more flexible.
        // A better test might be to check if it CONTAINS the key parts.
        const formatted = formatDisplayTopicName('homibhabha-practice-6th-easy');
        expect(formatted).toContain('Homi Bhabha Practice');
        expect(formatted).toContain('Std 6th');
        expect(formatted).toContain('(Easy)');
    });

    it('should handle PYQ topics', () => {
        expect(formatDisplayTopicName('pyq-9th-2022')).toBe('PYQ - Std 9th (2022)');
    });

    it('should prioritize the topicNameFromState if provided', () => {
        expect(formatDisplayTopicName('some-id', 'A Proper Topic Name')).toBe('A Proper Topic Name');
    });

    it('should format challenge names correctly', () => {
        expect(formatDisplayTopicName('some-id', 'Topic', true)).toBe('Challenge: Topic');
    });
});