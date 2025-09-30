// src/App.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Mock the entire AppProviders to avoid complex provider setup
jest.mock('./contexts/AppProviders', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-providers">{children}</div>
  ),
}));

// Mock AppRoutes to avoid routing complexity
jest.mock('./components/AppRoutes', () => {
  return function AppRoutes() {
    return <div data-testid="app-routes">App Routes</div>;
  };
});

// Mock NotificationManager
jest.mock('./components/core/NotificationManager', () => {
  return function NotificationManager() {
    return <div data-testid="notification-manager">Notifications</div>;
  };
});

// Mock ScrollToTop
jest.mock('./components/core/ScrollToTop', () => {
  return function ScrollToTop() {
    return <div data-testid="scroll-to-top">Scroll To Top</div>;
  };
});

describe('App Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders all required child components', () => {
    render(<App />);
    
    // Check that all main components are rendered
    expect(document.querySelector('[data-testid="app-providers"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="app-routes"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="notification-manager"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="scroll-to-top"]')).toBeInTheDocument();
  });

  it('has the correct component structure', () => {
    const { container } = render(<App />);
    
    // Verify the basic structure exists
    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelector('[data-testid="app-providers"]')).toBeInTheDocument();
  });

  it('includes ScrollToTop component in the structure', () => {
    render(<App />);
    expect(document.querySelector('[data-testid="scroll-to-top"]')).toBeInTheDocument();
  });

  it('includes NotificationManager component in the structure', () => {
    render(<App />);
    expect(document.querySelector('[data-testid="notification-manager"]')).toBeInTheDocument();
  });

  it('includes AppRoutes component in the structure', () => {
    render(<App />);
    expect(document.querySelector('[data-testid="app-routes"]')).toBeInTheDocument();
  });
});
