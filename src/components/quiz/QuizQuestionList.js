// src/components/quiz/QuizQuestionList.js
import React from 'react';
import QuestionItem from './QuestionItem'; // Assuming QuestionItem is in the same folder

function QuizQuestionList({
  questions,
  userAnswers,
  onOptionSelect,
  currentAccentColor,
}) {
  if (!questions || questions.length === 0) {
    return null; // Or some placeholder if needed, but parent usually handles empty state
  }

  return (
    <>
      {questions.map((question, index) => (
        <QuestionItem
          key={question.id || `q-${index}-${Math.random()}`}
          question={question} // question.options here will be an array
          questionNumber={index + 1}
          selectedOptionId={userAnswers[question.id]}
          onOptionSelect={onOptionSelect}
          accentColor={currentAccentColor}
        />
      ))}
    </>
  );
}

export default QuizQuestionList;