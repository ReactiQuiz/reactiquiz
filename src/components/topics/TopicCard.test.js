// src/components/topics/TopicCard.test.js
import { render, screen } from '../../test-utils'; // Use our new simplified render
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TopicCard from './TopicCard';

// --- START OF THE DEFINITIVE FIX ---
// We mock the hook that the component uses directly.
// This completely isolates the component from the actual context.
jest.mock('../../contexts/SubjectColorsContext', () => ({
  useSubjectColors: () => ({
    // We force the hook to return a predictable value for our test
    getColor: () => '#0070F3', 
  }),
}));
// --- END OF THE DEFINITIVE FIX ---

const mockTopic = {
  id: 'laws-of-motion-9th',
  name: 'Laws of Motion',
  description: 'A test description for the topic.',
  class: '9th',
  genre: 'State Board',
};

const mockOnStartQuiz = jest.fn();
const mockOnStudyFlashcards = jest.fn();
const mockOnPrintQuestions = jest.fn();

describe('TopicCard Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockOnStartQuiz.mockClear();
    mockOnStudyFlashcards.mockClear();
    mockOnPrintQuestions.mockClear();
    
    render(
      <TopicCard
        topic={mockTopic}
        onStartQuiz={mockOnStartQuiz}
        onStudyFlashcards={mockOnStudyFlashcards}
        onPrintQuestions={mockOnPrintQuestions}
        // We pass the accentColor prop as the component expects it
        accentColor="#0070F3" 
      />
    );
  });

  it('should render the topic name, description, and chips', () => {
    expect(screen.getByText('Laws of Motion')).toBeInTheDocument();
    expect(screen.getByText('A test description for the topic.')).toBeInTheDocument();
    expect(screen.getByText('Class 9th')).toBeInTheDocument();
    expect(screen.getByText('State Board')).toBeInTheDocument();
  });

  it('should call onStartQuiz when the quiz button is clicked', async () => {
    const user = userEvent.setup();
    const quizButton = screen.getByRole('button', { name: 'Start Quiz' });
    await user.click(quizButton);
    expect(mockOnStartQuiz).toHaveBeenCalledTimes(1);
  });

  it('should call onStudyFlashcards when the flashcards button is clicked', async () => {
    const user = userEvent.setup();
    const flashcardsButton = screen.getByRole('button', { name: 'Study Flashcards' });
    await user.click(flashcardsButton);
    expect(mockOnStudyFlashcards).toHaveBeenCalledTimes(1);
  });

  it('should call onPrintQuestions when the PDF button is clicked', async () => {
    const user = userEvent.setup();
    const pdfButton = screen.getByRole('button', { name: 'Print Questions' });
    await user.click(pdfButton);
    expect(mockOnPrintQuestions).toHaveBeenCalledTimes(1);
  });
});