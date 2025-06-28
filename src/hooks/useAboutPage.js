// src/hooks/useAboutPage.js
import { useState } from 'react';

/**
 * Custom hook to manage the state and logic for the About Page,
 * specifically for handling the contact information dialog.
 * @returns {object} An object containing the dialog state and handlers.
 */
export const useAboutPage = () => {
  // State for the contact info dialog
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');

  // Handler to open the dialog with specific content
  const handleOpenContactDialog = (title, content) => {
    setDialogTitle(title);
    setDialogContent(content);
    setIsContactDialogOpen(true);
  };

  // Handler to close the dialog
  const handleCloseContactDialog = () => {
    setIsContactDialogOpen(false);
  };

  return {
    isContactDialogOpen,
    dialogContent,
    dialogTitle,
    handleOpenContactDialog,
    handleCloseContactDialog,
  };
};