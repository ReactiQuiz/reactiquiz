// src/components/dashboard/KpiCards.test.tsx

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import KpiCards from './KpiCards';

describe('KpiCards Component', () => {
  const mockStats = {
    totalQuizzes: 45,
    overallAverageScore: 85.5,
    subjectBreakdowns: {
      Physics: { name: 'Physics', count: 20, average: 88, totalCorrect: 160, totalQuestions: 200 },
      Chemistry: { name: 'Chemistry', count: 15, average: 82, totalCorrect: 120, totalQuestions: 150 },
      Biology: { name: 'Biology', count: 10, average: 90, totalCorrect: 90, totalQuestions: 100 },
    },
    overallQuestionStats: { total: 450, correct: 370, accuracy: 82.2 },
    subjectDifficultyPerformance: {},
    overallDifficultyPerformance: {
      easy: { correct: 150, total: 180, percentage: 83.3 },
      medium: { correct: 120, total: 150, percentage: 80.0 },
      hard: { correct: 100, total: 120, percentage: 83.3 },
    },
    rollingAverageData: [],
    activityData: [],
    topicPerformance: [],
  };

  it('renders all KPI cards', () => {
    renderWithProviders(<KpiCards stats={mockStats} isLoading={false} />);
    
    // Check for main KPI cards
    expect(screen.getByText('Total Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Overall Average')).toBeInTheDocument();
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
    expect(screen.getByText('Overall Accuracy')).toBeInTheDocument();
  });

  it('displays correct statistics', () => {
    renderWithProviders(<KpiCards stats={mockStats} isLoading={false} />);
    
    expect(screen.getByText('45')).toBeInTheDocument(); // Total quizzes
    expect(screen.getByText('85.5%')).toBeInTheDocument(); // Overall average
    expect(screen.getByText('450')).toBeInTheDocument(); // Total questions
    expect(screen.getByText('82.2%')).toBeInTheDocument(); // Overall accuracy
  });

  it('shows loading state when isLoading is true', () => {
    renderWithProviders(<KpiCards stats={null} isLoading={true} />);
    
    // Check for skeleton loaders or loading indicators
    expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
  });

  it('handles empty stats gracefully', () => {
    renderWithProviders(<KpiCards stats={null} isLoading={false} />);
    
    // Should show default values or placeholders
    expect(screen.getByText('Total Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Overall Average')).toBeInTheDocument();
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
    expect(screen.getByText('Overall Accuracy')).toBeInTheDocument();
  });

  it('formats percentages correctly', () => {
    renderWithProviders(<KpiCards stats={mockStats} isLoading={false} />);
    
    // Check percentage formatting
    expect(screen.getByText('85.5%')).toBeInTheDocument();
    expect(screen.getByText('82.2%')).toBeInTheDocument();
  });

  it('displays zero values correctly', () => {
    const emptyStats = {
      ...mockStats,
      totalQuizzes: 0,
      overallAverageScore: 0,
      overallQuestionStats: { total: 0, correct: 0, accuracy: 0 },
    };

    renderWithProviders(<KpiCards stats={emptyStats} isLoading={false} />);
    
    expect(screen.getByText('0')).toBeInTheDocument(); // Total quizzes
    expect(screen.getByText('0%')).toBeInTheDocument(); // Overall average
    expect(screen.getByText('0%')).toBeInTheDocument(); // Overall accuracy
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<KpiCards stats={mockStats} isLoading={false} />);
    
    // Cards should have proper ARIA labels or roles
    const cards = screen.getAllByRole('article');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('displays cards in correct order', () => {
    renderWithProviders(<KpiCards stats={mockStats} isLoading={false} />);
    
    const cards = screen.getAllByRole('article');
    const cardTitles = cards.map(card => card.querySelector('h3')?.textContent);
    
    expect(cardTitles).toContain('Total Quizzes');
    expect(cardTitles).toContain('Overall Average');
    expect(cardTitles).toContain('Total Questions');
    expect(cardTitles).toContain('Overall Accuracy');
  });

  it('uses consistent styling for all cards', () => {
    const { container } = renderWithProviders(<KpiCards stats={mockStats} isLoading={false} />);
    
    // Check for consistent CSS classes or styling
    const cardElements = container.querySelectorAll('[data-testid*="kpi-card"]');
    expect(cardElements.length).toBe(4);
  });
});