/**
 * src/lib/time.ts
 * Zaman yardımcıları. Tüm gün alanları yerel 'YYYY-MM-DD' text.
 * Zaman damgaları ISO 8601 UTC string.
 */

import { format } from 'date-fns';

/**
 * Şimdiki zamanın ISO 8601 UTC string'ini döndürür.
 * Örnek: "2025-06-01T09:45:00.000Z"
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Yerel bugünün 'YYYY-MM-DD' string'ini döndürür.
 * Örnek: "2025-06-01"
 */
export function todayLocal(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Verilen Date nesnesini 'YYYY-MM-DD' formatına çevirir (yerel saat dilimi).
 */
export function toLocalDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * 'YYYY-MM-DD' string'ini Date nesnesine çevirir.
 * Saat dilimi problemi yaşamamak için UTC gece yarısı kullanılır.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
