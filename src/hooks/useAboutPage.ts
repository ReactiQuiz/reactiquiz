// src/hooks/useAboutPage.ts
import { useState } from 'react';

/**
 * Custom hook to manage the state and logic for the About Page,
 * specifically for handling the contact information dialog.
 * @returns {object} An object containing the dialog state and handlers.
 */
export const useAboutPage = () => {
  // State for the contact info dialog
  const [isContactDialogOpen, setIsContactDialogOpen] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<string>('');
  const [dialogTitle, setDialogTitle] = useState<string>('');

  // Handler to open the dialog with specific content
  const handleOpenContactDialog = (title: string, content: string) => {
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