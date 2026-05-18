import { describe, expect, it } from 'vitest';

import { formatDayNumber, formatDayOfWeek } from './calendar';

describe('formatDayOfWeek', () => {
  describe('weekday', () => {
    it('returns the correct 3-letter uppercase abbreviation', () => {
      expect(formatDayOfWeek(new Date('2026-04-06'))).toBe('MON');
    });
  });
  describe('weekend', () => {
    it('returns the correct 3-letter uppercase abbreviation', () => {
      expect(formatDayOfWeek(new Date('2026-04-11'))).toBe('SAT');
    });
  });
});

describe('formatDayNumber', () => {
  describe('single digit day', () => {
    it('returns zero-padded string', () => {
      expect(formatDayNumber(new Date('2026-04-04'))).toBe('04');
    });
  });
  describe('double digit day', () => {
    it('returns unpadded string', () => {
      expect(formatDayNumber(new Date('2026-04-14'))).toBe('14');
    });
  });
  describe('boundary — 9 to 10', () => {
    it('returns 09 on the 9th', () => {
      expect(formatDayNumber(new Date('2026-04-09'))).toBe('09');
    });
    it('returns 10 on the 10th', () => {
      expect(formatDayNumber(new Date('2026-04-10'))).toBe('10');
    });
  });
});
