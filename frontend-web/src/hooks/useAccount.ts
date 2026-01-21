// src/hooks/useAccount.ts
/**
 * Account Page Hook
 * 
 * This hook manages UI state for the Account page, specifically
 * the "Change Details" modal for updating user information.
 */
import { useState } from 'react';
import { UseAccountReturn } from '../types';

/**
 * useAccount Hook
 * 
 * A simplified hook that provides state management for the Account page,
 * specifically for the "Change Details" modal. This modal allows users
 * to update their account information (name, email, phone, etc.).
 * 
 * @returns {UseAccountReturn} An object containing:
 *   - changeDetailsModalOpen: Boolean state indicating if the modal is open
 *   - handleOpenChangeDetailsModal: Function to open the change details modal
 *   - handleCloseChangeDetailsModal: Function to close the change details modal
 */
export const useAccount = (): UseAccountReturn => {
  // State for the change details modal visibility
  const [changeDetailsModalOpen, setChangeDetailsModalOpen] = useState(false);

  /**
   * Handle Open Change Details Modal
   * 
   * Opens the modal that allows users to change their account details.
   * Called when the user clicks the "Change Details" button.
   */
  const handleOpenChangeDetailsModal = () => setChangeDetailsModalOpen(true);

  /**
   * Handle Close Change Details Modal
   * 
   * Closes the change details modal.
   * Called when the user clicks cancel, saves changes, or clicks outside the modal.
   */
  const handleCloseChangeDetailsModal = () => setChangeDetailsModalOpen(false);

  // Return only the state and handlers needed for the modal
  return {
    changeDetailsModalOpen,
    handleOpenChangeDetailsModal,
    handleCloseChangeDetailsModal,
  };
};