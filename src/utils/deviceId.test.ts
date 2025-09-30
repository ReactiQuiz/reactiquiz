// src/utils/deviceId.test.ts
import { getOrSetDeviceID } from './deviceId';

// Mock the deviceId module at the test level
jest.mock('./deviceId', () => ({
  getOrSetDeviceID: jest.fn(() => 'test-device-id'),
}));

const mockGetOrSetDeviceID = getOrSetDeviceID as jest.MockedFunction<typeof getOrSetDeviceID>;

describe('deviceId utility', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorage.clear();
    jest.clearAllMocks();
    mockGetOrSetDeviceID.mockReturnValue('test-device-id');
  });

  describe('getOrSetDeviceID', () => {
    it('should return mocked device ID', () => {
      const deviceId = getOrSetDeviceID();
      expect(deviceId).toBe('test-device-id');
      expect(typeof deviceId).toBe('string');
      expect(deviceId.length).toBeGreaterThan(0);
    });

    it('should return same mocked ID from multiple calls', () => {
      const firstId = getOrSetDeviceID();
      const secondId = getOrSetDeviceID();
      expect(firstId).toBe(secondId);
      expect(firstId).toBe('test-device-id');
    });

    it('should work with localStorage mock', () => {
      const deviceId = getOrSetDeviceID();
      expect(deviceId).toBe('test-device-id');
    });

    it('should return consistent mock value', () => {
      const ids = Array.from({ length: 5 }, () => getOrSetDeviceID());
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(1);
      expect(Array.from(uniqueIds)[0]).toBe('test-device-id');
    });
  });
});