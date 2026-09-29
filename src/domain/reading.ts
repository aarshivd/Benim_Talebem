import { addDays, todayLocal } from './dates';

export function calcPagesRead(from: number, to: number): number {
  return to - from;
}

export type ReadingEntryError = 'EMPTY' | 'BACKWARDS' | 'EXCEEDS_TOTAL' | 'INVALID';
export type ReadingEntryResult = { ok: true } | { ok: false; code: ReadingEntryError };

export function validateReadingEntry(params: {
  fromPage: number;
  toPage: number;
  totalPages: number;
}): ReadingEntryResult {
  const { fromPage, toPage, totalPages } = params;
  if (fromPage < 0 || toPage < 0 || totalPages <= 0) return { ok: false, code: 'INVALID' };
  if (fromPage === toPage) return { ok: false, code: 'EMPTY' };
  if (toPage < fromPage) return { ok: false, code: 'BACKWARDS' };
  if (toPage > totalPages) return { ok: false, code: 'EXCEEDS_TOTAL' };
  return { ok: true };
}

export function nextStatus(currentPage: number, totalPages: number): 'reading' | 'finished' {
  if (totalPages <= 0) return 'reading';
  return currentPage >= totalPages ? 'finished' : 'reading';
}

export function calcCurrentPage(logs: { toPage: number }[], startPage: number = 0): number {
  if (logs.length === 0) return startPage;
  return logs[logs.length - 1].toPage;
}

/**
 * Calculates the current reading streak (in days) based on a list of log dates.
 * If there is no log for today, the streak counts backwards starting from yesterday.
 * If there's a gap of 2 or more days from today, the streak is broken (0).
 */
export function calcStreak(days: string[], today: string = todayLocal()): number {
  if (!days || days.length === 0) return 0;
  
  const uniqueDays = Array.from(new Set(days)).sort((a, b) => b.localeCompare(a)); // Descending order
  
  let streak = 0;
  let checkDay = uniqueDays[0] === today ? today : addDays(today, -1);
  
  if (uniqueDays[0] !== today && uniqueDays[0] !== addDays(today, -1)) {
    return 0; // The latest log is older than yesterday
  }

  for (const d of uniqueDays) {
    if (d === checkDay) {
      streak++;
      checkDay = addDays(checkDay, -1);
    } else {
      break;
    }
  }
  
  return streak;
}
