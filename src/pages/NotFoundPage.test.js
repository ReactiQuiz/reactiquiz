// src/pages/NotFoundPage.test.js
import { render, screen } from '../test-utils'; // CORRECTED PATH
import '@testing-library/jest-dom';
import NotFoundPage from './NotFoundPage';

// ... rest of the file is correct
describe('NotFoundPage', () => {
  it('should render the 404 message and a link to the homepage', () => {
    render(<NotFoundPage />);
    expect(screen.getByRole('heading', { name: /404 - Page Not Found/i })).toBeInTheDocument();
    expect(screen.getByText(/Oops! The page you are looking for does not exist/i)).toBeInTheDocument();
    const homeButton = screen.getByRole('link', { name: /Go to Homepage/i });
    expect(homeButton).toBeInTheDocument();
    expect(homeButton).toHaveAttribute('href', '/');
  });
});