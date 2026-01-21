// src/components/quiz/QuizQuestionList.tsx
/**
 * Quiz Question List Component
 * 
 * This component renders a list of quiz questions by mapping over
 * the questions array and rendering each as a QuestionItem.
 * It manages the display of all questions in the quiz.
 */
import React from 'react';
import QuestionItem from './QuestionItem';
import { Question } from '../../types';

/**
 * QuizQuestionListProps Interface
 * 
 * Props for the QuizQuestionList component.
 */
interface QuizQuestionListProps {
  questions: Question[]; // Array of questions to display
  userAnswers: Record<string, number>; // Map of question IDs to selected option indices
  onOptionSelect: (questionId: string, optionIndex: number) => void; // Callback when option is selected
  accentColor: string; // Accent color for styling
}

/**
 * Quiz Question List Component
 * 
 * Displays a list of quiz questions. Features:
 * - Maps over questions array
 * - Renders each question as a QuestionItem
 * - Passes user answers for selected option highlighting
 * - Provides option selection callback
 * 
 * This component is used on the QuizPage to display all questions
 * in the current quiz session.
 * 
 * @param {QuizQuestionListProps} props - Component props
 * @returns {JSX.Element | null} List of question items or null if no questions
 */
const QuizQuestionList: React.FC<QuizQuestionListProps> = ({
  questions,
  userAnswers,
  onOptionSelect,
  accentColor,
}) => {
  // Don't render if no questions available
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <>
      {/* Map over questions array and render each as QuestionItem */}
      {questions.map((question, index) => (
        <QuestionItem
          key={question.id || `q-${index}-${Math.random()}`} // Use question ID or generate key
          question={question} // Question object
          questionNumber={index + 1} // 1-indexed question number
          selectedOptionId={userAnswers[question.id]} // Get selected option for this question
          onOptionSelect={onOptionSelect} // Option selection callback
          accentColor={accentColor} // Accent color for styling
        />
      ))}
    </>
  );
};

export default QuizQuestionList;
