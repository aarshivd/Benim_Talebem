/**
 * src/db/repositories/pointEvents.ts
 */

import { eq, and, isNull, gte, lte, sql } from 'drizzle-orm';
import type { AppDB } from '@/db/client';
import { pointEvents, readingLogs, students } from '@/db/schema';
import type { NewPointEvent, PointEvent } from '@/db/schema';
import { notDeleted, softDelete, touch } from '@/db/helpers';
import { newId } from '@/lib/id';
import { nowIso } from '@/lib/time';

export async function listByStudent(db: AppDB, studentId: string): Promise<PointEvent[]> {
  return db
    .select()
    .from(pointEvents)
    .where(
      and(eq(pointEvents.studentId, studentId), notDeleted(pointEvents.deletedAt)),
    )
    .orderBy(pointEvents.date);
}

export async function getPointEvent(db: AppDB, id: string): Promise<PointEvent | null> {
  const rows = await db
    .select()
    .from(pointEvents)
    .where(and(eq(pointEvents.id, id), notDeleted(pointEvents.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createPointEvent(
  db: AppDB,
  data: Omit<NewPointEvent, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
): Promise<PointEvent> {
  const now = nowIso();
  const id = newId();
  await db.insert(pointEvents).values({ ...data, id, createdAt: now, updatedAt: now });
  return (await getPointEvent(db, id))!;
}

export async function updatePointEvent(
  db: AppDB,
  id: string,
  data: Partial<Omit<NewPointEvent, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
): Promise<void> {
  await db
    .update(pointEvents)
    .set({ ...touch(), ...data })
    .where(and(eq(pointEvents.id, id), notDeleted(pointEvents.deletedAt)));
}

export async function softDeletePointEvent(db: AppDB, id: string): Promise<void> {
  await db
    .update(pointEvents)
    .set(softDelete())
    .where(and(eq(pointEvents.id, id), isNull(pointEvents.deletedAt)));
}

/**
 * Okuma kaydından gelen point_event'i upsert eder.
 * points == 0 ise mevcut 'reading' kaydını soft-delete eder.
 * Kısmi benzersiz indeks (student_id, date, source='reading') garanti eder.
 */
export async function upsertReadingEvent(
  db: AppDB,
  studentId: string,
  day: string,
  points: number,
  title: string,
): Promise<void> {
  // Mevcut reading event var mı?
  const existing = await db
    .select()
    .from(pointEvents)
    .where(
      and(
        eq(pointEvents.studentId, studentId),
        eq(pointEvents.date, day),
        eq(pointEvents.source, 'reading'),
        isNull(pointEvents.deletedAt),
      ),
    )
    .limit(1);

  if (points === 0) {
    // 0 puan → soft-delete
    if (existing.length > 0) {
      await softDeletePointEvent(db, existing[0].id);
    }
    return;
  }

  const now = nowIso();

  if (existing.length > 0) {
    // Güncelle
    await db
      .update(pointEvents)
      .set({ points, title, updatedAt: now })
      .where(eq(pointEvents.id, existing[0].id));
  } else {
    // Yeni oluştur
    await db.insert(pointEvents).values({
      id: newId(),
      studentId,
      date: day,
      points,
      title,
      source: 'reading',
      createdAt: now,
      updatedAt: now,
    });
  }
}

export interface StudentTotals {
  studentId: string;
  points: number;
  pages: number;
}

export interface GetTotalsOptions {
  from: string; // 'YYYY-MM-DD'
  to: string;
  groupId?: string;
}

/**
 * Belirli tarih aralığı ve isteğe bağlı grup için her öğrencinin
 * toplam puanını ve okuduğu sayfayı döndürür.
 */
export async function getTotals(
  db: AppDB,
  options: GetTotalsOptions,
): Promise<StudentTotals[]> {
  const { from, to, groupId } = options;

  // Puan toplamları
  const pointRows = await db
    .select({
      studentId: pointEvents.studentId,
      points: sql<number>`COALESCE(SUM(${pointEvents.points}), 0)`,
    })
    .from(pointEvents)
    .where(
      and(
        gte(pointEvents.date, from),
        lte(pointEvents.date, to),
        notDeleted(pointEvents.deletedAt),
      ),
    )
    .groupBy(pointEvents.studentId);

  // Sayfa toplamları
  const pageRows = await db
    .select({
      studentId: readingLogs.studentId,
      pages: sql<number>`COALESCE(SUM(${readingLogs.pagesRead}), 0)`,
    })
    .from(readingLogs)
    .where(
      and(
        gte(readingLogs.date, from),
        lte(readingLogs.date, to),
        notDeleted(readingLogs.deletedAt),
      ),
    )
    .groupBy(readingLogs.studentId);

  // Birleştir
  const pointMap = new Map(pointRows.map((r) => [r.studentId, r.points]));
  const pageMap = new Map(pageRows.map((r) => [r.studentId, r.pages]));

  // Tüm ilgili student ID'leri
  const allIds = new Set([...pointMap.keys(), ...pageMap.keys()]);

  // groupId filtresi
  let filteredIds = [...allIds];
  if (groupId) {
    const groupStudents = await db
      .select({ id: students.id })
      .from(students)
      .where(
        and(
          eq(students.groupId, groupId),
          notDeleted(students.deletedAt),
        ),
      );
    const groupSet = new Set(groupStudents.map((s) => s.id));
    filteredIds = filteredIds.filter((id) => groupSet.has(id));
  }

  return filteredIds.map((studentId) => ({
    studentId,
    points: pointMap.get(studentId) ?? 0,
    pages: pageMap.get(studentId) ?? 0,
  }));
}
