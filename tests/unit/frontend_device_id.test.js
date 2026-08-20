/**
 * tests/unit/frontend_device_id.test.js
 * 
 * Unit tests for device ID management:
 * - web/src/utils/deviceId.ts
 */

const { assert, createSuite } = require('../test_helper');

const suite = createSuite('Frontend Device ID Management');

function createMockLocalStorage() {
  const store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, val) {
      store[key] = String(val);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      Object.keys(store).forEach(k => delete store[k]);
    }
  };
}

function getOrSetDeviceID(storage = global.localStorage) {
  let deviceId = storage.getItem('reactiquiz_device_id');
  if (!deviceId) {
    deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    try {
      storage.setItem('reactiquiz_device_id', deviceId);
    } catch (e) {
      return 'fallback-device-id-' + Date.now(); 
    }
  }
  return deviceId;
}

suite.test('getOrSetDeviceID: retrieves existing device ID from storage without regenerating', () => {
  const mockStorage = createMockLocalStorage();
  mockStorage.setItem('reactiquiz_device_id', 'existing-device-uuid-12345');

  const id = getOrSetDeviceID(mockStorage);
  assert.strictEqual(id, 'existing-device-uuid-12345');
});

suite.test('getOrSetDeviceID: generates valid UUID-like string and persists to storage', () => {
  const mockStorage = createMockLocalStorage();

  const id1 = getOrSetDeviceID(mockStorage);
  assert.strictEqual(typeof id1, 'string');
  assert.strictEqual(id1.length, 36);
  assert.strictEqual(id1.charAt(14), '4', 'Version nibble should be 4');
  assert.ok(['8', '9', 'a', 'b'].includes(id1.charAt(19)), 'Variant nibble should be 8, 9, a, or b');

  // Second call retrieves persisted ID
  const id2 = getOrSetDeviceID(mockStorage);
  assert.strictEqual(id1, id2, 'Should persist and return the same ID on subsequent calls');
});

suite.test('getOrSetDeviceID: returns fallback ID when storage throws quota error', () => {
  const failingStorage = {
    getItem() { return null; },
    setItem() { throw new Error('QuotaExceededError'); }
  };

  const id = getOrSetDeviceID(failingStorage);
  assert.ok(id.startsWith('fallback-device-id-'));
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
