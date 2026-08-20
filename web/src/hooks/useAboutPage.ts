// src/hooks/useAboutPage.ts
/**
 * About Page Hook
 * 
 * This hook manages the state and logic for the About Page component,
 * specifically for handling the contact information dialog.
 */
import { useState } from 'react';

/**
 * useAboutPage Hook
 * 
 * Custom hook that provides state management and handlers for the contact
 * information dialog on the About Page. The dialog displays various contact
 * information (email, phone, address, etc.) when users click on contact links.
 * 
 * @returns {object} An object containing:
 *   - isContactDialogOpen: Boolean state indicating if dialog is open
 *   - dialogContent: String content to display in the dialog
 *   - dialogTitle: String title for the dialog
 *   - handleOpenContactDialog: Function to open dialog with title and content
 *   - handleCloseContactDialog: Function to close the dialog
 */
export const useAboutPage = () => {
  // State for the contact info dialog visibility
  const [isContactDialogOpen, setIsContactDialogOpen] = useState<boolean>(false);
  // State for the dialog content (e.g., email, phone, address)
  const [dialogContent, setDialogContent] = useState<string>('');
  // State for the dialog title (e.g., "Email", "Phone", "Address")
  const [dialogTitle, setDialogTitle] = useState<string>('');

  /**
   * Handle Open Contact Dialog
   * 
   * Opens the contact dialog with the specified title and content.
   * This is called when a user clicks on a contact information link.
   * 
   * @param {string} title - The title to display in the dialog header
   * @param {string} content - The content to display in the dialog body
   */
  const handleOpenContactDialog = (title: string, content: string) => {
    setDialogTitle(title);
    setDialogContent(content);
    setIsContactDialogOpen(true);
  };

  /**
   * Handle Close Contact Dialog
   * 
   * Closes the contact dialog and clears its state.
   * Called when the user clicks the close button or outside the dialog.
   */
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