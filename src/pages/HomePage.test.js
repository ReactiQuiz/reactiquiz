// src/pages/HomePage.test.js
import { render, screen } from '../test-utils'; // CORRECTED PATH
import '@testing-library/jest-dom';
import HomePage from './HomePage';

// ... rest of the file is correct
jest.mock('../components/home/HeroSection', () => () => <div>HeroSection</div>);
jest.mock('../components/home/AboutSummarySection', () => () => <div>AboutSummarySection</div>);
jest.mock('../components/home/KeyFeaturesSection', () => () => <div>KeyFeaturesSection</div>);
jest.mock('../components/home/CallToActionSection', () => () => <div>CallToActionSection</div>);

describe('HomePage', () => {
  it('should render all of its main child sections', () => {
    render(<HomePage />);
    expect(screen.getByText('HeroSection')).toBeInTheDocument();
    expect(screen.getByText('AboutSummarySection')).toBeInTheDocument();
    expect(screen.getByText('KeyFeaturesSection')).toBeInTheDocument();
    expect(screen.getByText('CallToActionSection')).toBeInTheDocument();
  });
});