/**
 * src/db/repositories/students.ts
 */

import { eq, and, isNull, like, sql, inArray } from 'drizzle-orm';
import type { AppDB } from '@/db/client';
import { students } from '@/db/schema';
import type { NewStudent, Student } from '@/db/schema';
import { notDeleted, softDelete, touch } from '@/db/helpers';
import { newId } from '@/lib/id';
import { nowIso } from '@/lib/time';

export interface ListByGroupOptions {
  search?: string;
  includeInactive?: boolean;
}

export async function listByGroup(
  db: AppDB,
  groupId: string,
  options: ListByGroupOptions = {},
): Promise<Student[]> {
  const { search, includeInactive = false } = options;

  const conditions = [
    eq(students.groupId, groupId),
    notDeleted(students.deletedAt),
    ...(!includeInactive ? [eq(students.isActive, true)] : []),
    ...(search ? [like(students.firstName, `%${search}%`)] : []),
  ];

  return db
    .select()
    .from(students)
    .where(and(...conditions))
    .orderBy(students.firstName, students.lastName);
}

export async function countByGroup(
  db: AppDB,
  groupId: string,
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(students)
    .where(
      and(
        eq(students.groupId, groupId),
        notDeleted(students.deletedAt),
        eq(students.isActive, true),
      ),
    );
  return result[0]?.count ?? 0;
}

export async function getStudent(db: AppDB, id: string): Promise<Student | null> {
  const rows = await db
    .select()
    .from(students)
    .where(and(eq(students.id, id), notDeleted(students.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listActiveStudents(db: AppDB, groupId?: string): Promise<Student[]> {
  const conditions = [
    notDeleted(students.deletedAt),
    eq(students.isActive, true),
    ...(groupId ? [eq(students.groupId, groupId)] : []),
  ];

  return db
    .select()
    .from(students)
    .where(and(...conditions))
    .orderBy(students.firstName, students.lastName);
}

export async function createStudent(
  db: AppDB,
  data: Omit<NewStudent, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
): Promise<Student> {
  const now = nowIso();
  const id = newId();
  await db.insert(students).values({ ...data, id, createdAt: now, updatedAt: now });
  return (await getStudent(db, id))!;
}

export async function updateStudent(
  db: AppDB,
  id: string,
  data: Partial<Omit<NewStudent, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
): Promise<void> {
  await db
    .update(students)
    .set({ ...touch(), ...data })
    .where(and(eq(students.id, id), notDeleted(students.deletedAt)));
}

export async function softDeleteStudent(db: AppDB, id: string): Promise<void> {
  await db
    .update(students)
    .set(softDelete())
    .where(and(eq(students.id, id), isNull(students.deletedAt)));
}

export async function moveToGroup(
  db: AppDB,
  studentIds: string[],
  groupId: string,
): Promise<void> {
  if (studentIds.length === 0) return;
  await db
    .update(students)
    .set({ ...touch(), groupId })
    .where(
      and(
        inArray(students.id, studentIds),
        notDeleted(students.deletedAt),
      ),
    );
}
