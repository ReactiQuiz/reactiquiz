// src/utils/deviceId.ts

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