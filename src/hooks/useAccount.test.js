// src/hooks/useAccount.test.js

import { renderHook, act } from '@testing-library/react';
import { useAccount } from './useAccount';

describe('useAccount hook', () => {

  it('should initialize with the modal being closed', () => {
    const { result } = renderHook(() => useAccount());
    expect(result.current.changeDetailsModalOpen).toBe(false);
  });

  it('should open the modal when handleOpenChangeDetailsModal is called', () => {
    const { result } = renderHook(() => useAccount());

    act(() => {
      result.current.handleOpenChangeDetailsModal();
    });

    expect(result.current.changeDetailsModalOpen).toBe(true);
  });

  it('should close the modal when handleCloseChangeDetailsModal is called', () => {
    const { result } = renderHook(() => useAccount());

    // First, open the modal to set up the state
    act(() => {
      result.current.handleOpenChangeDetailsModal();
    });

    // Verify it's open before trying to close it
    expect(result.current.changeDetailsModalOpen).toBe(true);

    // Now, call the closing function
    act(() => {
      result.current.handleCloseChangeDetailsModal();
    });

    expect(result.current.changeDetailsModalOpen).toBe(false);
  });
});