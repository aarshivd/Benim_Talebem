/**
 * src/db/repositories/readingLogs.ts
 */

import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import type { AppDB } from '@/db/client';
import { readingLogs, students } from '@/db/schema';
import type { NewReadingLog, ReadingLog } from '@/db/schema';
import { notDeleted, softDelete, touch } from '@/db/helpers';
import { newId } from '@/lib/id';
import { nowIso } from '@/lib/time';

export async function listByStudentBook(
  db: AppDB,
  studentId: string,
  bookId: string,
): Promise<ReadingLog[]> {
  return db
    .select()
    .from(readingLogs)
    .where(
      and(
        eq(readingLogs.studentId, studentId),
        eq(readingLogs.bookId, bookId),
        notDeleted(readingLogs.deletedAt),
      ),
    )
    .orderBy(desc(readingLogs.date));
}

export async function listByStudent(
  db: AppDB,
  studentId: string,
): Promise<ReadingLog[]> {
  return db
    .select()
    .from(readingLogs)
    .where(
      and(
        eq(readingLogs.studentId, studentId),
        notDeleted(readingLogs.deletedAt),
      ),
    )
    .orderBy(desc(readingLogs.date));
}

export async function getLast(
  db: AppDB,
  studentId: string,
  bookId: string,
): Promise<ReadingLog | null> {
  const rows = await db
    .select()
    .from(readingLogs)
    .where(
      and(
        eq(readingLogs.studentId, studentId),
        eq(readingLogs.bookId, bookId),
        notDeleted(readingLogs.deletedAt),
      ),
    )
    .orderBy(desc(readingLogs.date))
    .limit(1);
  return rows[0] ?? null;
}

/** Bir öğrencinin belirli bir günde okuduğu toplam sayfayı döndürür */
export async function sumPagesByStudentDay(
  db: AppDB,
  studentId: string,
  day: string,
): Promise<number> {
  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(pages_read), 0)` })
    .from(readingLogs)
    .where(
      and(
        eq(readingLogs.studentId, studentId),
        eq(readingLogs.date, day),
        notDeleted(readingLogs.deletedAt),
      ),
    );
  return result[0]?.total ?? 0;
}

/** Belirtilen günde okuma kaydı olmayan öğrencileri döndürür */
export async function listStudentsWithoutLogOn(
  db: AppDB,
  day: string,
  groupId?: string,
): Promise<string[]> {
  // Aktif öğrencilerin id'lerini al
  const activeStudentRows = await db
    .select({ id: students.id })
    .from(students)
    .where(
      and(
        notDeleted(students.deletedAt),
        eq(students.isActive, true),
        ...(groupId ? [eq(students.groupId, groupId)] : []),
      ),
    );

  const activeIds = activeStudentRows.map((r) => r.id);
  if (activeIds.length === 0) return [];

  // O gün okuma kaydı olan öğrencileri bul
  const logsOnDay = await db
    .select({ studentId: readingLogs.studentId })
    .from(readingLogs)
    .where(
      and(
        eq(readingLogs.date, day),
        notDeleted(readingLogs.deletedAt),
      ),
    );

  const idsWithLog = new Set(logsOnDay.map((r) => r.studentId));
  return activeIds.filter((id) => !idsWithLog.has(id));
}

export async function getReadingLog(db: AppDB, id: string): Promise<ReadingLog | null> {
  const rows = await db
    .select()
    .from(readingLogs)
    .where(and(eq(readingLogs.id, id), notDeleted(readingLogs.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createReadingLog(
  db: AppDB,
  data: Omit<NewReadingLog, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
): Promise<ReadingLog> {
  const now = nowIso();
  const id = newId();
  await db.insert(readingLogs).values({ ...data, id, createdAt: now, updatedAt: now });
  return (await getReadingLog(db, id))!;
}

export async function updateReadingLog(
  db: AppDB,
  id: string,
  data: Partial<Omit<NewReadingLog, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
): Promise<void> {
  await db
    .update(readingLogs)
    .set({ ...touch(), ...data })
    .where(and(eq(readingLogs.id, id), notDeleted(readingLogs.deletedAt)));
}

export async function softDeleteReadingLog(db: AppDB, id: string): Promise<void> {
  await db
    .update(readingLogs)
    .set(softDelete())
    .where(and(eq(readingLogs.id, id), isNull(readingLogs.deletedAt)));
}
