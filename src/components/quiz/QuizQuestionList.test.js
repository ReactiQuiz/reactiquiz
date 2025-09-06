import { render, screen } from '../../test-utils';
import '@testing-library/jest-dom';
jest.mock('../shared/MarkdownRenderer');
import QuizQuestionList from './QuizQuestionList';

describe('QuizQuestionList', () => {
  it('renders a list of questions', () => {
    const questions = [
      { id: 'q1', text: 'A', options: [{ id: 'a', text: 'a' }] },
      { id: 'q2', text: 'B', options: [{ id: 'b', text: 'b' }] },
    ];
    render(
      <QuizQuestionList
        questions={questions}
        userAnswers={{}}
        onOptionSelect={() => {}}
      />
    );
    expect(screen.getByText(/Question 1/)).toBeInTheDocument();
    expect(screen.getByText(/Question 2/)).toBeInTheDocument();
  });
});


