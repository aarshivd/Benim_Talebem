import { format, parse, isValid, addDays as dateFnsAddDays, eachDayOfInterval } from 'date-fns';
import { tr } from 'date-fns/locale';

export function toLocalDay(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayLocal(): string {
  return toLocalDay(new Date());
}

export function isValidDay(day: string): boolean {
  try {
    const parsed = parse(day, 'yyyy-MM-dd', new Date());
    return isValid(parsed) && format(parsed, 'yyyy-MM-dd') === day;
  } catch {
    return false;
  }
}

export function addDays(day: string, n: number): string {
  const parsed = parse(day, 'yyyy-MM-dd', new Date());
  return format(dateFnsAddDays(parsed, n), 'yyyy-MM-dd');
}

export function isWithin(day: string, start: string, end: string): boolean {
  if (!isValidDay(day) || !isValidDay(start) || !isValidDay(end)) return false;
  if (start > end) return false;
  return day >= start && day <= end;
}

export function formatDayTr(day: string): string {
  const parsed = parse(day, 'yyyy-MM-dd', new Date());
  return format(parsed, 'd MMMM eeee', { locale: tr });
}

export function dayRange(start: string, end: string): string[] {
  if (!isValidDay(start) || !isValidDay(end) || start > end) return [];
  const parsedStart = parse(start, 'yyyy-MM-dd', new Date());
  const parsedEnd = parse(end, 'yyyy-MM-dd', new Date());
  return eachDayOfInterval({ start: parsedStart, end: parsedEnd }).map(d => format(d, 'yyyy-MM-dd'));
}
