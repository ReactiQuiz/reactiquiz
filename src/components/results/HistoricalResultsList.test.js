import { render, screen } from '../../test-utils';
import '@testing-library/jest-dom';
import HistoricalResultsList from './HistoricalResultsList';

// Mock subject colors to avoid context dependency
jest.mock('../../contexts/SubjectColorsContext', () => ({
  useSubjectColors: () => ({ getColor: () => '#0070F3' }),
}));

const sample = [
  { id: 'r1', score: 80, date: '2024-01-01', subject: 'Math' },
  { id: 'r2', score: 70, date: '2023-12-01', subject: 'Math' },
];

describe('HistoricalResultsList', () => {
  it('shows empty state when no results', () => {
    render(
      <HistoricalResultsList
        results={[]}
        filters={{ class: 'all', genre: 'all' }}
        setFilters={() => {}}
        sortOrder={'date_desc'}
        setSortOrder={() => {}}
        availableClasses={['9th']}
        availableGenres={['State Board']}
        clearFilters={() => {}}
      />
    );
    expect(screen.getByText(/No Saved Results Found/i)).toBeInTheDocument();
  });

  it('renders Most Recent section when results exist', () => {
    render(
      <HistoricalResultsList
        results={sample}
        filters={{ class: 'all', genre: 'all' }}
        setFilters={() => {}}
        sortOrder={'date_desc'}
        setSortOrder={() => {}}
        availableClasses={['9th']}
        availableGenres={['State Board']}
        clearFilters={() => {}}
      />
    );
    expect(screen.getByText(/Most Recent/i)).toBeInTheDocument();
  });
});


