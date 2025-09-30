// src/utils/formatTime.test.ts
import { formatTime, formatDate } from './formatTime';

describe('formatTime utility', () => {
  describe('formatTime', () => {
    it('should format seconds under a minute correctly', () => {
      expect(formatTime(0)).toBe('00s');
      expect(formatTime(30)).toBe('30s');
      expect(formatTime(59)).toBe('59s');
    });

    it('should format minutes correctly', () => {
      expect(formatTime(60)).toBe('01m 00s');
      expect(formatTime(95)).toBe('01m 35s');
      expect(formatTime(3599)).toBe('59m 59s');
    });

    it('should format hours correctly', () => {
      expect(formatTime(3600)).toBe('01h 00m 00s');
      expect(formatTime(3661)).toBe('01h 01m 01s');
      expect(formatTime(7200)).toBe('02h 00m 00s');
    });

    it('should pad single digits with zeros', () => {
      expect(formatTime(1)).toBe('01s');
      expect(formatTime(61)).toBe('01m 01s');
      expect(formatTime(3661)).toBe('01h 01m 01s');
    });

    it('should handle invalid inputs', () => {
      expect(formatTime(null)).toBe('N/A');
      expect(formatTime(undefined)).toBe('N/A');
      expect(formatTime(-10)).toBe('N/A');
      expect(formatTime(NaN)).toBe('N/A');
    });
  });

  describe('formatDate', () => {
    it('should format valid dates correctly', () => {
      const date = new Date('2025-09-30T14:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('2025');
      expect(formatted).toContain('Sep');
    });

    it('should format date strings correctly', () => {
      const formatted = formatDate('2025-09-30T14:30:00Z');
      expect(formatted).toContain('2025');
    });

    it('should handle invalid inputs', () => {
      expect(formatDate(null)).toBe('Unknown date');
      expect(formatDate(undefined)).toBe('Unknown date');
      expect(formatDate('invalid')).toBe('Invalid date');
    });
  });
});