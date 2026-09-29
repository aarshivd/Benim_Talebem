import { validateTerm, hasOverlap, findActive, suggestNextTerm } from '../terms';

describe('Domain: terms', () => {
  describe('validateTerm', () => {
    it('returns true for valid dates in order', () => {
      expect(validateTerm({ startDate: '2023-01-01', endDate: '2023-06-30' })).toEqual({ ok: true });
    });

    it('returns error if startDate > endDate', () => {
      expect(validateTerm({ startDate: '2023-06-30', endDate: '2023-01-01' })).toEqual({
        ok: false,
        error: 'Başlangıç tarihi bitiş tarihinden sonra olamaz'
      });
    });

    it('returns error for invalid date format', () => {
      expect(validateTerm({ startDate: 'invalid', endDate: '2023-06-30' })).toEqual({
        ok: false,
        error: 'Geçersiz tarih formatı'
      });
    });
  });

  describe('hasOverlap', () => {
    it('detects overlap when one term is inside another', () => {
      expect(hasOverlap(
        { startDate: '2023-01-01', endDate: '2023-06-30' },
        { startDate: '2023-03-01', endDate: '2023-04-01' }
      )).toBe(true);
    });

    it('detects overlap at the edges (inclusive)', () => {
      expect(hasOverlap(
        { startDate: '2023-01-01', endDate: '2023-06-30' },
        { startDate: '2023-06-30', endDate: '2023-12-31' }
      )).toBe(true);
    });

    it('returns false for disjoint terms', () => {
      expect(hasOverlap(
        { startDate: '2023-01-01', endDate: '2023-06-30' },
        { startDate: '2023-07-01', endDate: '2023-12-31' }
      )).toBe(false);
    });
  });

  describe('findActive', () => {
    it('returns the active term', () => {
      const terms = [
        { id: '1', startDate: '2023-01-01', endDate: '2023-06-30', isActive: false },
        { id: '2', startDate: '2023-07-01', endDate: '2023-12-31', isActive: true },
      ];
      expect(findActive(terms)?.id).toBe('2');
    });

    it('returns null if no active term', () => {
      const terms = [
        { id: '1', startDate: '2023-01-01', endDate: '2023-06-30', isActive: false },
      ];
      expect(findActive(terms)).toBeNull();
    });

    it('throws error if multiple active terms', () => {
      const terms = [
        { id: '1', startDate: '2023-01-01', endDate: '2023-06-30', isActive: true },
        { id: '2', startDate: '2023-07-01', endDate: '2023-12-31', isActive: true },
      ];
      expect(() => findActive(terms)).toThrow('Birden fazla aktif dönem bulundu');
    });
  });

  describe('suggestNextTerm', () => {
    it('suggests a term starting 1 day after the previous ends, and ending 180 days later', () => {
      const result = suggestNextTerm({ endDate: '2023-06-30' });
      expect(result.startDate).toBe('2023-07-01');
      // 2023-07-01 + 180 days is 2023-12-28
      expect(result.endDate).toBe('2023-12-28');
    });
  });
});
