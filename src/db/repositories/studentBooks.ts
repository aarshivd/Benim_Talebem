/**
 * src/db/repositories/studentBooks.ts
 */

import { eq, and, isNull } from 'drizzle-orm';
import type { AppDB } from '@/db/client';
import { studentBooks } from '@/db/schema';
import type { NewStudentBook, StudentBook } from '@/db/schema';
import { notDeleted, softDelete, touch } from '@/db/helpers';
import { newId } from '@/lib/id';
import { nowIso } from '@/lib/time';

export async function listByStudent(db: AppDB, studentId: string): Promise<StudentBook[]> {
  return db
    .select()
    .from(studentBooks)
    .where(and(eq(studentBooks.studentId, studentId), notDeleted(studentBooks.deletedAt)));
}

export async function listByBook(db: AppDB, bookId: string): Promise<StudentBook[]> {
  return db
    .select()
    .from(studentBooks)
    .where(and(eq(studentBooks.bookId, bookId), notDeleted(studentBooks.deletedAt)));
}

export async function getPair(
  db: AppDB,
  studentId: string,
  bookId: string,
): Promise<StudentBook | null> {
  const rows = await db
    .select()
    .from(studentBooks)
    .where(
      and(
        eq(studentBooks.studentId, studentId),
        eq(studentBooks.bookId, bookId),
        notDeleted(studentBooks.deletedAt),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function getStudentBook(db: AppDB, id: string): Promise<StudentBook | null> {
  const rows = await db
    .select()
    .from(studentBooks)
    .where(and(eq(studentBooks.id, id), notDeleted(studentBooks.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createStudentBook(
  db: AppDB,
  data: Omit<NewStudentBook, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
): Promise<StudentBook> {
  const now = nowIso();
  const id = newId();
  await db.insert(studentBooks).values({ ...data, id, createdAt: now, updatedAt: now });
  return (await getStudentBook(db, id))!;
}

export async function updateStudentBook(
  db: AppDB,
  id: string,
  data: Partial<Omit<NewStudentBook, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
): Promise<void> {
  await db
    .update(studentBooks)
    .set({ ...touch(), ...data })
    .where(and(eq(studentBooks.id, id), notDeleted(studentBooks.deletedAt)));
}

export async function softDeleteStudentBook(db: AppDB, id: string): Promise<void> {
  await db
    .update(studentBooks)
    .set(softDelete())
    .where(and(eq(studentBooks.id, id), isNull(studentBooks.deletedAt)));
}
