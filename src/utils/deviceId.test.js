// src/utils/deviceId.test.js
import { getOrSetDeviceID } from './deviceId';

// Mock localStorage since it doesn't exist in the Jest (Node.js) environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

// Assign the mock to the global window object before tests run
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('getOrSetDeviceID utility', () => {
  // Clear the mock storage before each test to ensure isolation
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should generate and set a new device ID if one does not exist', () => {
    const deviceId = getOrSetDeviceID();
    
    // Check that the returned ID is a valid-looking UUID string
    expect(deviceId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    // Check that the generated ID was also saved to our mock localStorage
    expect(window.localStorage.getItem('reactiquiz_device_id')).toBe(deviceId);
  });

  it('should retrieve an existing device ID from localStorage', () => {
    // First, set a known ID in storage
    const existingId = 'test-device-id-123';
    window.localStorage.setItem('reactiquiz_device_id', existingId);

    const deviceId = getOrSetDeviceID();

    // Assert that the function returned the ID we pre-set
    expect(deviceId).toBe(existingId);
  });
});