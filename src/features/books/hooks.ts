/**
 * src/features/books/hooks.ts
 * Books feature — TanStack Query hooks.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/db/client';
import { listBooks, getBook, createBook, updateBook, softDeleteBook } from '@/db/repositories/books';
import { listByBook, listByStudent, getPair, createStudentBook } from '@/db/repositories/studentBooks';
import { todayLocal } from '@/domain';

export const BOOK_KEYS = {
  all: ['books'] as const,
  detail: (id: string) => ['books', id] as const,
  byStudent: (studentId: string) => ['books', 'student', studentId] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

export function useBooks() {
  return useQuery({ queryKey: BOOK_KEYS.all, queryFn: () => listBooks(db) });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: BOOK_KEYS.detail(id),
    queryFn: () => getBook(db, id),
    enabled: !!id,
  });
}

/** Talebeye atanmış kitaplar (studentBooks + book bilgisiyle) */
export function useStudentBooks(studentId: string) {
  return useQuery({
    queryKey: BOOK_KEYS.byStudent(studentId),
    queryFn: async () => {
      const sbs = await listByStudent(db, studentId);
      const withBook = await Promise.all(
        sbs.map(async (sb) => ({
          ...sb,
          book: await getBook(db, sb.bookId),
        })),
      );
      return withBook.filter((sb) => sb.book !== null);
    },
    enabled: !!studentId,
  });
}

/** Bir kitabı okuyan öğrenciler */
export function useBookReaders(bookId: string) {
  return useQuery({
    queryKey: ['books', bookId, 'readers'],
    queryFn: () => listByBook(db, bookId),
    enabled: !!bookId,
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

type CreateBookInput = Parameters<typeof createBook>[1];
type UpdateBookInput = Parameters<typeof updateBook>[2];

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookInput) => createBook(db, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOOK_KEYS.all }),
  });
}

export function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookInput }) =>
      updateBook(db, id, data),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: BOOK_KEYS.all });
      qc.invalidateQueries({ queryKey: BOOK_KEYS.detail(id) });
    },
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteBook(db, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOOK_KEYS.all }),
  });
}

/** Talebeye kitap ata */
export function useAssignBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      bookId,
      startPage = 0,
    }: {
      studentId: string;
      bookId: string;
      startPage?: number;
    }) => {
      // Daha önce atandıysa hata fırlat
      const existing = await getPair(db, studentId, bookId);
      if (existing) throw new Error('Bu kitap bu talebeye zaten atanmış.');

      return createStudentBook(db, {
        studentId,
        bookId,
        currentPage: startPage,
        status: 'reading',
        startedOn: todayLocal(),
        finishedOn: null,
      });
    },
    onSuccess: (_r, { studentId }) => {
      qc.invalidateQueries({ queryKey: BOOK_KEYS.byStudent(studentId) });
      qc.invalidateQueries({ queryKey: BOOK_KEYS.all });
    },
  });
}
