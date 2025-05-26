// src/utils/formatTime.js
export const formatTime = (totalSeconds) => {
  if (totalSeconds == null || typeof totalSeconds !== 'number' || totalSeconds < 0) {
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