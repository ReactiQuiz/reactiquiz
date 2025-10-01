// src/test-utils.ts

import React, { ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from './contexts/ThemeContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { User } from './types';

// Mock user data for testing
export const mockUser: User = {
  id: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  name: 'Test User',
  phone: '+1234567890',
  address: 'Test Address',
  class: '12',
  isAdmin: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-user-id',
  username: 'admin',
  email: 'admin@example.com',
  name: 'Admin User',
  isAdmin: true,
};

interface TestProvidersProps {
  children?: ReactNode;
  queryClient?: QueryClient;
  initialEntries?: string[];
}

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Silence logs in tests by overriding console methods if needed

const TestProviders: React.FC<TestProvidersProps> = ({ 
  children, 
  queryClient = createTestQueryClient(),
  initialEntries = ['/'],
}) => {
  const Router = initialEntries.length > 1 || initialEntries[0] !== '/' ? MemoryRouter : BrowserRouter;
  const routerProps = initialEntries.length > 1 || initialEntries[0] !== '/' ? { initialEntries } : {};

  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(
      Router,
      routerProps,
      React.createElement(
        AppThemeProvider,
        null,
        React.createElement(
          NotificationsProvider,
          null,
          children
        )
      )
    )
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialEntries?: string[];
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

/**
 * Render function with essential providers for testing.
 * Provides QueryClient, Router, Theme, and Notifications context.
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const { queryClient, initialEntries, wrapper, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    if (wrapper) {
      const CustomWrapper = wrapper;
      return React.createElement(
        TestProviders,
        { queryClient, initialEntries },
        React.createElement(CustomWrapper, null, children)
      );
    }
    return React.createElement(
      TestProviders,
      { queryClient, initialEntries },
      children
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Create a mock AuthContext provider for testing
 */
export const createMockAuthProvider = (user: User | null = mockUser) => {
  const MockAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const mockAuthValue = {
      currentUser: user,
      isLoadingAuth: false,
      signIn: jest.fn().mockResolvedValue({ token: 'test-token', user }),
      signUp: jest.fn().mockResolvedValue({ success: true }),
      signOut: jest.fn(),
      updateCurrentUserDetails: jest.fn(),
    };

    const AuthContext = React.createContext(mockAuthValue);
    return React.createElement(AuthContext.Provider, { value: mockAuthValue }, children);
  };

  return MockAuthProvider;
};

/**
 * Helper to render components with auth context
 */
export const renderWithAuth = (
  ui: React.ReactElement,
  options: CustomRenderOptions & { user?: User | null } = {}
): RenderResult => {
  const { user = mockUser, ...restOptions } = options;
  const MockAuthProvider = createMockAuthProvider(user);

  return renderWithProviders(ui, {
    ...restOptions,
    wrapper: MockAuthProvider,
  });
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };
