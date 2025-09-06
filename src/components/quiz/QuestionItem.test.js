import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
// Mock MarkdownRenderer used inside QuestionItem to avoid heavy remark deps
jest.mock('../shared/MarkdownRenderer', () => {
  return function MockMarkdownRenderer({ text }) {
    return <div data-testid="markdown-content">{text}</div>;
  };
});
import QuestionItem from './QuestionItem';

describe('QuestionItem', () => {
  it('renders question and allows selecting an option', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const question = {
      id: 'q1',
      text: 'What is 2+2?',
      options: [
        { id: 'o1', text: '3' },
        { id: 'o2', text: '4' },
      ],
    };
    render(
      <QuestionItem
        question={question}
        questionNumber={1}
        selectedOptionId={null}
        onOptionSelect={onSelect}
      />
    );
    expect(screen.getByText(/Question 1/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /4/ }));
    expect(onSelect).toHaveBeenCalledWith('q1', 'o2');
  });
});


