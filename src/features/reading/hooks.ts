/**
 * src/features/reading/hooks.ts
 * Reading feature — TanStack Query hooks + service bridge.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/db/client';
import { listByStudentBook, listByStudent, sumPagesByStudentDay, getLast } from '@/db/repositories/readingLogs';
import { recordReading, deleteLastLog, editLastLog } from './service';
import type { RecordReadingInput } from './service';

export const READING_KEYS = {
  all: ['reading'] as const,
  byStudentBook: (studentId: string, bookId: string) =>
    ['reading', studentId, bookId] as const,
  dailyPages: (studentId: string, day: string) =>
    ['reading', 'daily', studentId, day] as const,
  lastLog: (studentId: string, bookId: string) =>
    ['reading', 'last', studentId, bookId] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

export function useReadingLogs(studentId: string, bookId: string) {
  return useQuery({
    queryKey: READING_KEYS.byStudentBook(studentId, bookId),
    queryFn: () => listByStudentBook(db, studentId, bookId),
    enabled: !!studentId && !!bookId,
  });
}

export function useAllStudentLogs(studentId: string) {
  return useQuery({
    queryKey: ['reading', 'all-student', studentId],
    queryFn: () => listByStudent(db, studentId),
    enabled: !!studentId,
  });
}

export function useDailyPages(studentId: string, day: string) {
  return useQuery({
    queryKey: READING_KEYS.dailyPages(studentId, day),
    queryFn: () => sumPagesByStudentDay(db, studentId, day),
    enabled: !!studentId && !!day,
  });
}

export function useLastLog(studentId: string, bookId: string) {
  return useQuery({
    queryKey: READING_KEYS.lastLog(studentId, bookId),
    queryFn: () => getLast(db, studentId, bookId),
    enabled: !!studentId && !!bookId,
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export function useRecordReading() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordReadingInput) => recordReading(db, input),
    onSuccess: (_r, input) => {
      qc.invalidateQueries({ queryKey: ['reading'] });
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['points'] });
    },
  });
}

export function useDeleteLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => deleteLastLog(db, logId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reading'] });
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['points'] });
    },
  });
}

export function useEditLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      logId,
      newToPage,
      bookTotalPages,
    }: {
      logId: string;
      newToPage: number;
      bookTotalPages: number;
    }) => editLastLog(db, logId, newToPage, bookTotalPages),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reading'] });
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['points'] });
    },
  });
}
