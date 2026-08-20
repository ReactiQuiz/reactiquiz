// src/utils/deviceId.ts
/**
 * Device ID Utilities
 * 
 * This file provides functionality for managing device identifiers.
 * Generates and stores a unique device ID in localStorage for tracking
 * and analytics purposes.
 */

/**
 * Get Or Set Device ID
 * 
 * Retrieves an existing device ID from localStorage, or generates a new
 * UUID-like identifier if one doesn't exist. The device ID is persisted
 * in localStorage for subsequent visits.
 * 
 * The generated ID follows a UUID v4-like format (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx).
 * 
 * @returns {string} Unique device identifier
 * @throws {Error} Returns fallback ID if localStorage is unavailable or full
 */
export function getOrSetDeviceID(): string {
  let deviceId = localStorage.getItem('reactiquiz_device_id');
  if (!deviceId) {
    // Generate a simple UUID-like string
    // For production, consider a more robust UUID library
    deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c: string) {
      // eslint-disable-next-line
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    try {
      localStorage.setItem('reactiquiz_device_id', deviceId);
    } catch (e: any) {
      console.error("Error setting device ID in localStorage:", e);
      // Fallback or error handling if localStorage is not available/full
      return 'fallback-device-id-' + Date.now(); 
    }
  }
  return deviceId;
}