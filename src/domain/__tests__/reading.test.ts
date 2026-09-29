import { calcPagesRead, validateReadingEntry, nextStatus, calcCurrentPage, calcStreak } from '../reading';

describe('Domain: reading', () => {
  it('calcPagesRead returns the difference between to and from', () => {
    expect(calcPagesRead(40, 55)).toBe(15);
  });

  describe('validateReadingEntry', () => {
    it('returns EMPTY when from == to', () => {
      expect(validateReadingEntry({ fromPage: 10, toPage: 10, totalPages: 100 })).toEqual({ ok: false, code: 'EMPTY' });
    });

    it('returns BACKWARDS when to < from', () => {
      expect(validateReadingEntry({ fromPage: 20, toPage: 10, totalPages: 100 })).toEqual({ ok: false, code: 'BACKWARDS' });
    });

    it('returns EXCEEDS_TOTAL when to > totalPages', () => {
      expect(validateReadingEntry({ fromPage: 50, toPage: 150, totalPages: 100 })).toEqual({ ok: false, code: 'EXCEEDS_TOTAL' });
    });

    it('returns INVALID for negative values or zero total', () => {
      expect(validateReadingEntry({ fromPage: -1, toPage: 10, totalPages: 100 })).toEqual({ ok: false, code: 'INVALID' });
      expect(validateReadingEntry({ fromPage: 0, toPage: 10, totalPages: 0 })).toEqual({ ok: false, code: 'INVALID' });
    });

    it('returns ok for valid entry', () => {
      expect(validateReadingEntry({ fromPage: 0, toPage: 100, totalPages: 100 })).toEqual({ ok: true });
    });
  });

  describe('nextStatus', () => {
    it('returns finished when currentPage >= totalPages', () => {
      expect(nextStatus(100, 100)).toBe('finished');
      expect(nextStatus(105, 100)).toBe('finished');
    });

    it('returns reading when currentPage < totalPages', () => {
      expect(nextStatus(50, 100)).toBe('reading');
    });

    it('returns reading if totalPages <= 0', () => {
      expect(nextStatus(10, 0)).toBe('reading');
    });
  });

  describe('calcCurrentPage', () => {
    it('returns startPage if logs is empty', () => {
      expect(calcCurrentPage([], 10)).toBe(10);
      expect(calcCurrentPage([])).toBe(0);
    });

    it('returns the toPage of the last log', () => {
      expect(calcCurrentPage([{ toPage: 10 }, { toPage: 30 }])).toBe(30);
    });
  });

  describe('calcStreak', () => {
    it('calculates streak of consecutive days', () => {
      const today = '2023-10-03';
      const days = ['2023-10-01', '2023-10-02', '2023-10-03'];
      expect(calcStreak(days, today)).toBe(3);
    });

    it('continues streak if today is missed but yesterday has a log', () => {
      const today = '2023-10-04';
      const days = ['2023-10-01', '2023-10-02', '2023-10-03'];
      expect(calcStreak(days, today)).toBe(3);
    });

    it('breaks streak (returns 0) if 2 or more days gap', () => {
      const today = '2023-10-05';
      const days = ['2023-10-01', '2023-10-02', '2023-10-03'];
      expect(calcStreak(days, today)).toBe(0);
    });

    it('handles duplicate days in logs', () => {
      const today = '2023-10-03';
      const days = ['2023-10-02', '2023-10-03', '2023-10-03'];
      expect(calcStreak(days, today)).toBe(2);
    });

    it('returns 0 for empty array', () => {
      expect(calcStreak([], '2023-10-03')).toBe(0);
    });
  });
});
