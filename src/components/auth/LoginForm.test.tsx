// src/components/auth/LoginForm.test.tsx

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils';
import LoginForm from './LoginForm';

describe('LoginForm Component', () => {
  const mockOnSubmit = jest.fn();
  
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isSubmitting: false,
  };

  beforeEach(() => {
    mockOnSubmit.mockReset();
  });

  it('renders login form elements', () => {
    renderWithProviders(<LoginForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles username input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm {...defaultProps} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, 'testuser');
    
    expect(usernameInput).toHaveValue('testuser');
  });

  it('handles password input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm {...defaultProps} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'testpassword');
    
    expect(passwordInput).toHaveValue('testpassword');
  });

  it('calls onSubmit with correct credentials when form is submitted', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm {...defaultProps} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('testuser', 'testpassword');
    });
  });

  it('prevents form submission when fields are empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    // HTML5 validation should prevent submission
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('disables submit button when isSubmitting is true', () => {
    renderWithProviders(<LoginForm {...defaultProps} isSubmitting={true} />);
    
    const submitButton = screen.getByRole('button', { name: /signing in/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state when submitting', () => {
    renderWithProviders(<LoginForm {...defaultProps} isSubmitting={true} />);
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it('displays info message when provided', () => {
    const infoMessage = 'Please sign in to continue';
    renderWithProviders(<LoginForm {...defaultProps} infoMessage={infoMessage} />);
    
    expect(screen.getByText(infoMessage)).toBeInTheDocument();
  });

  it('handles form submission with Enter key', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm {...defaultProps} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpassword');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('testuser', 'testpassword');
    });
  });

  it('maintains form state during validation errors', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm {...defaultProps} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'short');
    
    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('short');
  });
});