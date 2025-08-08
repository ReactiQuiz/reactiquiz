// src/components/shared/EmptyState.test.js

import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EmptyState from './EmptyState';
import BarChartIcon from '@mui/icons-material/BarChart';

const mockOnActionClick = jest.fn();

describe('EmptyState Component', () => {

  beforeEach(() => {
    mockOnActionClick.mockClear();
  });

  it('should render the title, message, and action button correctly', () => {
    render(
      <EmptyState
        IconComponent={BarChartIcon}
        title="No Data Available"
        message="Please select a different filter to see data."
        actionText="Clear Filters"
        onActionClick={mockOnActionClick}
      />
    );

    expect(screen.getByText('No Data Available')).toBeInTheDocument();
    expect(screen.getByText('Please select a different filter to see data.')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Clear Filters' });
    expect(button).toBeInTheDocument();
  });

  it('should render the icon component', () => {
    render(
        <EmptyState
          IconComponent={BarChartIcon}
          title="No Data Available"
          message="Please select a different filter to see data."
        />
      );
    expect(screen.getByTestId('BarChartIcon')).toBeInTheDocument();
  });

  it('should call the onActionClick handler when the button is clicked', async () => {
    render(
        <EmptyState
          IconComponent={BarChartIcon}
          title="No Data Available"
          message="Please select a different filter to see data."
          actionText="Clear Filters"
          onActionClick={mockOnActionClick}
        />
      );
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: 'Clear Filters' });

    await user.click(button);

    expect(mockOnActionClick).toHaveBeenCalledTimes(1);
  });

  // --- START OF FIX ---
  // This test case now renders its own instance of the component
  // without the button prop, and does not use the problematic { container: document.body }
  it('should not render a button if onActionClick prop is not provided', () => {
    render(
        <EmptyState
          IconComponent={BarChartIcon}
          title="No Data"
          message="Nothing here."
        />
    );
  
    // queryByRole returns null if the element is not found, which is what we want.
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });
  // --- END OF FIX ---
});