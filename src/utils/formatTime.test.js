// src/utils/formatTime.test.js

import { formatTime } from './formatTime';

// 'describe' is a way to group related tests together for better organization.
describe('formatTime utility', () => {

  // 'it' or 'test' defines a single, specific test case.
  // The string describes what this case is testing.
  it('should format seconds into a "Xs" format when under a minute', () => {
    // 'expect' is the assertion. We expect the result of our function
    // 'toBe' a specific value.
    expect(formatTime(59)).toBe('59s');
  });

  it('should format seconds into a "Xm Ys" format when over a minute', () => {
    expect(formatTime(95)).toBe('01m 35s');
    expect(formatTime(60)).toBe('01m 00s');
  });

  it('should format seconds into a "Xh Ym Zs" format when over an hour', () => {
    expect(formatTime(3661)).toBe('01h 01m 01s');
  });

  it('should correctly pad single-digit values with a leading zero', () => {
    expect(formatTime(61)).toBe('01m 01s');
  });

  it('should handle the zero case correctly', () => {
    expect(formatTime(0)).toBe('00s');
  });

  it('should return "N/A" for invalid inputs like null, undefined, or strings', () => {
    expect(formatTime(null)).toBe('N/A');
    expect(formatTime(undefined)).toBe('N/A');
    expect(formatTime('abc')).toBe('N/A');
    expect(formatTime(-10)).toBe('N/A');
  });
});