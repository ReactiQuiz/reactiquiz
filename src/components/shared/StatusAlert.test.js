import { render, screen } from '../../test-utils';
import '@testing-library/jest-dom';
import StatusAlert from './StatusAlert';

// Mock Material UI components to avoid test issues
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Paper: ({ children, ...props }) => <div data-testid="paper" {...props}>{children}</div>,
    Box: ({ children, ...props }) => <div data-testid="box" {...props}>{children}</div>,
    Typography: ({ children, ...props }) => <div data-testid="typography" {...props}>{children}</div>,
    useTheme: () => ({
      palette: {
        info: { main: '#2196f3' },
        error: { main: '#f44336' },
        text: { primary: '#000', secondary: '#666' }
      }
    }),
    alpha: () => 'rgba(0,0,0,0.1)'
  };
});

describe('StatusAlert', () => {
  it('renders info variant by default', () => {
    render(<StatusAlert message="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders error variant', () => {
    render(<StatusAlert message="Oops" severity="error" />);
    expect(screen.getByText('Oops')).toBeInTheDocument();
  });
});




