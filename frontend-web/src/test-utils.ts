// src/test-utils.ts
/**
 * Test Utilities
 * 
 * This file provides utilities and helpers for testing React components.
 * It includes mock data, test providers, and rendering utilities that wrap
 * components with all necessary context providers for testing.
 */
import React, { ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from './contexts/ThemeContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { User } from './types';

/**
 * Mock User Data
 * 
 * Standard mock user object for testing components that require user context.
 * This user has standard permissions (not admin).
 */
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

/**
 * Mock Admin User Data
 * 
 * Mock user object with admin privileges for testing admin-specific components.
 * Based on mockUser but with isAdmin set to true and admin-specific details.
 */
export const mockAdminUser: User = {
  ...mockUser, // Spread mockUser to inherit all standard user properties
  id: 'admin-user-id', // Unique admin user ID
  username: 'admin', // Admin username
  email: 'admin@example.com', // Admin email
  name: 'Admin User', // Admin display name
  isAdmin: true, // Admin flag set to true
};

/**
 * TestProvidersProps Interface
 * 
 * Props for the TestProviders component that wraps test components
 * with all necessary context providers.
 */
interface TestProvidersProps {
  children?: ReactNode; // React children to wrap
  queryClient?: QueryClient; // Optional custom QueryClient instance
  initialEntries?: string[]; // Optional initial router entries for MemoryRouter
}

/**
 * Create Test Query Client
 * 
 * Creates a QueryClient instance optimized for testing:
 * - No retries on failed requests (faster failures)
 * - No cache time (immediate garbage collection)
 * - No stale time (always considered stale)
 * 
 * This ensures tests run quickly and don't have caching side effects.
 * 
 * @returns {QueryClient} Configured QueryClient for testing
 */
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Don't retry failed queries in tests
      gcTime: 0, // Immediately garbage collect unused cache (was cacheTime)
      staleTime: 0, // Always consider data stale
    },
    mutations: {
      retry: false, // Don't retry failed mutations in tests
    },
  },
});

/**
 * Test Providers Component
 * 
 * Wraps test components with all necessary context providers:
 * - QueryClientProvider: For React Query data fetching
 * - Router: BrowserRouter or MemoryRouter based on initialEntries
 * - AppThemeProvider: For theme context
 * - NotificationsProvider: For notification context
 * 
 * Automatically chooses between BrowserRouter (default) and MemoryRouter
 * (when initialEntries are provided) for flexible routing in tests.
 */
const TestProviders: React.FC<TestProvidersProps> = ({ 
  children, 
  queryClient = createTestQueryClient(),
  initialEntries = ['/'],
}) => {
  // Determine if MemoryRouter should be used based on initialEntries
  // Use MemoryRouter if multiple entries or non-default entry provided
  const isMemory = initialEntries.length > 1 || initialEntries[0] !== '/';
  const Router = isMemory ? MemoryRouter : BrowserRouter;

  return React.createElement(
    QueryClientProvider,
    { client: queryClient }, // Provide QueryClient for data fetching
    React.createElement(
      Router as any,
      // Only pass initialEntries when using MemoryRouter (it's required for MemoryRouter)
      isMemory ? { initialEntries } : undefined,
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

/**
 * CustomRenderOptions Interface
 * 
 * Extended render options for custom render function.
 * Adds support for QueryClient, router initial entries, and custom wrapper.
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient; // Optional custom QueryClient instance
  initialEntries?: string[]; // Optional initial router entries
  wrapper?: React.ComponentType<{ children: ReactNode }>; // Optional additional wrapper component
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
 * Create Mock Auth Provider
 * 
 * Creates a mock AuthContext provider for testing components that require
 * authentication context. The provider includes all necessary auth methods
 * mocked with jest.fn() for testing.
 * 
 * @param {User | null} user - User object to use in auth context (defaults to mockUser)
 * @returns {React.ComponentType} Mock AuthProvider component
 */
export const createMockAuthProvider = (user: User | null = mockUser) => {
  const MockAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Create mock auth context value with all necessary methods
    const mockAuthValue = {
      currentUser: user, // Current user object (or null if not logged in)
      isLoadingAuth: false, // Auth loading state (false for tests)
      signIn: jest.fn().mockResolvedValue({ token: 'test-token', user }), // Mock sign-in method
      signUp: jest.fn().mockResolvedValue({ success: true }), // Mock sign-up method
      signOut: jest.fn(), // Mock sign-out method
      updateCurrentUserDetails: jest.fn(), // Mock update user details method
    };

    // Create AuthContext and provide mock value
    const AuthContext = React.createContext(mockAuthValue);
    return React.createElement(AuthContext.Provider, { value: mockAuthValue }, children);
  };

  return MockAuthProvider;
};

/**
 * Render With Auth
 * 
 * Helper function to render components with auth context included.
 * This is a convenience wrapper around renderWithProviders that automatically
 * includes a mock auth provider.
 * 
 * @param {React.ReactElement} ui - Component to render
 * @param {CustomRenderOptions & { user?: User | null }} options - Render options including optional user
 * @returns {RenderResult} Render result from testing library
 * 
 * Usage:
 *   const { getByText } = renderWithAuth(<MyComponent />, { user: mockUser });
 */
export const renderWithAuth = (
  ui: React.ReactElement,
  options: CustomRenderOptions & { user?: User | null } = {}
): RenderResult => {
  // Extract user from options (default to mockUser if not provided)
  const { user = mockUser, ...restOptions } = options;
  // Create mock auth provider with specified user
  const MockAuthProvider = createMockAuthProvider(user);

  // Render with providers, including the mock auth provider as wrapper
  return renderWithProviders(ui, {
    ...restOptions,
    wrapper: MockAuthProvider, // Add auth context to the provider chain
  });
};

// Re-export everything from testing library for convenience
export * from '@testing-library/react';
// Re-export render as renderWithProviders for backward compatibility
export { renderWithProviders as render };
