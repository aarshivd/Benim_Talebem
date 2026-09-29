import { isValidDay, addDays } from './dates';

export interface TermData {
  id: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export function validateTerm(term: { startDate: string; endDate: string }): { ok: boolean; error?: string } {
  if (!isValidDay(term.startDate) || !isValidDay(term.endDate)) {
    return { ok: false, error: 'Geçersiz tarih formatı' };
  }
  if (term.startDate > term.endDate) {
    return { ok: false, error: 'Başlangıç tarihi bitiş tarihinden sonra olamaz' };
  }
  return { ok: true };
}

export function hasOverlap(term1: { startDate: string; endDate: string }, term2: { startDate: string; endDate: string }): boolean {
  return term1.startDate <= term2.endDate && term1.endDate >= term2.startDate;
}

export function findActive(terms: TermData[]): TermData | null {
  const activeTerms = terms.filter(t => t.isActive);
  if (activeTerms.length > 1) {
    throw new Error('Birden fazla aktif dönem bulundu');
  }
  return activeTerms[0] || null;
}

export function suggestNextTerm(previousTerm: { endDate: string }): { startDate: string; endDate: string } {
  const startDate = addDays(previousTerm.endDate, 1);
  const endDate = addDays(startDate, 180);
  return { startDate, endDate };
}
