// src/components/quiz/QuizQuestionList.tsx
import React from 'react';
import QuestionItem from './QuestionItem';
import { Question } from '../../types';

interface QuizQuestionListProps {
  questions: Question[];
  userAnswers: Record<string, number>;
  onOptionSelect: (questionId: string, optionIndex: number) => void;
  accentColor: string;
}

const QuizQuestionList: React.FC<QuizQuestionListProps> = ({
  questions,
  userAnswers,
  onOptionSelect,
  accentColor,
}) => {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <>
      {questions.map((question, index) => (
        <QuestionItem
          key={question.id || `q-${index}-${Math.random()}`}
          question={question}
          questionNumber={index + 1}
          selectedOptionId={userAnswers[question.id]}
          onOptionSelect={onOptionSelect}
          accentColor={accentColor}
        />
      ))}
    </>
  );
};

export default QuizQuestionList;
