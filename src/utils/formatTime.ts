// src/utils/formatTime.ts
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