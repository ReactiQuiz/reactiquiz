import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ResultsFilters from './ResultsFilters';

describe('ResultsFilters', () => {
  it('calls callbacks when filters and sort change', async () => {
    const user = userEvent.setup();
    const setFilters = jest.fn();
    const setSortOrder = jest.fn();
    render(
      <ResultsFilters
        filters={{ class: 'all', genre: 'all' }}
        setFilters={setFilters}
        sortOrder={'date_desc'}
        setSortOrder={setSortOrder}
        availableClasses={['9th', '10th']}
        availableGenres={['State Board', 'CBSE']}
      />
    );

    await user.selectOptions(screen.getByLabelText(/filter by class/i), '9th');
    expect(setFilters).toHaveBeenCalled();

    await user.selectOptions(screen.getByLabelText(/filter by genre/i), 'CBSE');
    expect(setFilters).toHaveBeenCalled();

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'score_desc');
    expect(setSortOrder).toHaveBeenCalled();
  });
});


