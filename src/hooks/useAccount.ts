// src/hooks/useAccount.ts
import { useState } from 'react';
import { UseAccountReturn } from '../types';

/**
 * A simplified hook to manage UI state for the Account page,
 * specifically the "Change Details" modal.
 */
export const useAccount = (): UseAccountReturn => {
  const [changeDetailsModalOpen, setChangeDetailsModalOpen] = useState(false);

  const handleOpenChangeDetailsModal = () => setChangeDetailsModalOpen(true);
  const handleCloseChangeDetailsModal = () => setChangeDetailsModalOpen(false);

  // Return only the state and handlers needed for the modal
  return {
    changeDetailsModalOpen,
    handleOpenChangeDetailsModal,
    handleCloseChangeDetailsModal,
  };
};