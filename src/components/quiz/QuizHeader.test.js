import { render, screen } from '../../test-utils';
import '@testing-library/jest-dom';
import QuizHeader from './QuizHeader';

describe('QuizHeader', () => {
  it('renders title and timer', () => {
    render(<QuizHeader title="Physics Quiz" timeRemaining={125} onFinish={() => {}} />);
    expect(screen.getByText('Physics Quiz')).toBeInTheDocument();
    expect(screen.getByText(/2:05/)).toBeInTheDocument();
  });
});




