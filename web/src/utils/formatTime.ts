// src/utils/formatTime.ts
/**
 * Time Formatting Utilities
 * 
 * This file provides functions for formatting time values into human-readable strings.
 * Supports both time duration formatting and date/time formatting.
 */

/**
 * Format Time
 * 
 * Formats a time duration in seconds into a human-readable string.
 * Handles hours, minutes, and seconds display with proper formatting.
 * 
 * Format examples:
 * - Less than 1 minute: "45s"
 * - Less than 1 hour: "5m 30s"
 * - 1 hour or more: "2h 15m 30s"
 * 
 * @param {number | null | undefined} totalSeconds - Total seconds to format
 * @returns {string} Formatted time string or 'N/A' if invalid input
 */
export const formatTime = (totalSeconds: number | null | undefined): string => {
  if (totalSeconds == null || typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds < 0) {
    return 'N/A';
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${paddedHours}h ${paddedMinutes}m ${paddedSeconds}s`;
  }
  if (minutes > 0) {
    return `${paddedMinutes}m ${paddedSeconds}s`;
  }
  return `${paddedSeconds}s`;
};

/**
 * Formats a date string or timestamp into a readable format
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return 'Unknown date';
  
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};