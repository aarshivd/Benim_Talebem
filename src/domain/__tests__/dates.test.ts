import { toLocalDay, todayLocal, isValidDay, addDays, isWithin, formatDayTr, dayRange } from '../dates';

describe('Domain: dates', () => {
  it('toLocalDay formats Date object correctly', () => {
    const d = new Date(2023, 9, 5, 23, 30); // 5 Oct 2023 23:30 local time
    expect(toLocalDay(d)).toBe('2023-10-05');
  });

  it('todayLocal returns a string', () => {
    expect(typeof todayLocal()).toBe('string');
    expect(todayLocal()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('isValidDay validates YYYY-MM-DD correctly', () => {
    expect(isValidDay('2023-10-05')).toBe(true);
    expect(isValidDay('2023-02-29')).toBe(false); // Not a leap year
    expect(isValidDay('2024-02-29')).toBe(true); // Leap year
    expect(isValidDay('invalid')).toBe(false);
  });

  it('addDays correctly adds or subtracts days across month boundaries', () => {
    expect(addDays('2023-10-31', 1)).toBe('2023-11-01');
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
    expect(addDays('2023-01-01', -1)).toBe('2022-12-31');
  });

  it('isWithin checks inclusive bounds', () => {
    expect(isWithin('2023-10-15', '2023-10-01', '2023-10-31')).toBe(true);
    expect(isWithin('2023-10-01', '2023-10-01', '2023-10-31')).toBe(true); // inclusive left
    expect(isWithin('2023-10-31', '2023-10-01', '2023-10-31')).toBe(true); // inclusive right
    expect(isWithin('2023-11-01', '2023-10-01', '2023-10-31')).toBe(false); // outside
    expect(isWithin('2023-10-15', '2023-11-01', '2023-10-01')).toBe(false); // inverted range
    expect(isWithin('invalid', '2023-10-01', '2023-10-31')).toBe(false); // invalid day
  });

  it('formatDayTr formats the date in Turkish', () => {
    // 2023-09-29 is a Friday (Cuma)
    expect(formatDayTr('2023-09-29')).toBe('29 Eylül Cuma');
  });

  it('dayRange generates a range of dates', () => {
    expect(dayRange('2023-10-01', '2023-10-03')).toEqual([
      '2023-10-01',
      '2023-10-02',
      '2023-10-03',
    ]);
    expect(dayRange('2023-10-01', '2023-10-01')).toEqual(['2023-10-01']);
    expect(dayRange('2023-10-02', '2023-10-01')).toEqual([]); // inverted
    expect(dayRange('invalid', '2023-10-01')).toEqual([]);
  });
});
