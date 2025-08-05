// src/hooks/useAccount.js
import { useState } from 'react';

/**
 * A simplified hook to manage UI state for the Account page,
 * specifically the "Change Details" modal.
 */
export const useAccount = () => {
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