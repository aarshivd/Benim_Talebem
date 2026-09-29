import { calcReadingPoints, validateManualPoints } from '../points';

describe('Domain: points', () => {
  describe('calcReadingPoints', () => {
    it('calculates points without bonus', () => {
      // 10 pages per point, 15 pages -> 1 point
      expect(calcReadingPoints({
        dailyPages: 15,
        pagesPerPoint: 10,
        goalPages: 20,
        goalBonus: 5
      })).toBe(1);
    });

    it('calculates points with bonus when goal is reached', () => {
      // 10 pages per point, 20 pages -> 2 points + 5 bonus = 7 points
      expect(calcReadingPoints({
        dailyPages: 20,
        pagesPerPoint: 10,
        goalPages: 20,
        goalBonus: 5
      })).toBe(7);
    });

    it('does not give bonus if goalPages is 0 (disabled)', () => {
      expect(calcReadingPoints({
        dailyPages: 20,
        pagesPerPoint: 10,
        goalPages: 0,
        goalBonus: 5
      })).toBe(2);
    });

    it('returns 0 if dailyPages is 0', () => {
      expect(calcReadingPoints({
        dailyPages: 0,
        pagesPerPoint: 10,
        goalPages: 20,
        goalBonus: 5
      })).toBe(0);
    });
  });

  describe('validateManualPoints', () => {
    it('returns false for 0 points', () => {
      expect(validateManualPoints({ points: 0, allowNegative: true })).toBe(false);
      expect(validateManualPoints({ points: 0, allowNegative: false })).toBe(false);
    });

    it('returns true for positive points', () => {
      expect(validateManualPoints({ points: 5, allowNegative: true })).toBe(true);
      expect(validateManualPoints({ points: 5, allowNegative: false })).toBe(true);
    });

    it('validates negative points based on allowNegative', () => {
      expect(validateManualPoints({ points: -5, allowNegative: true })).toBe(true);
      expect(validateManualPoints({ points: -5, allowNegative: false })).toBe(false);
    });
  });
});
