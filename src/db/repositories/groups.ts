/**
 * src/db/repositories/groups.ts
 */

import { eq, isNull, and, asc } from 'drizzle-orm';
import type { AppDB } from '@/db/client';
import { groups } from '@/db/schema';
import type { NewGroup, Group } from '@/db/schema';
import { notDeleted, softDelete, touch } from '@/db/helpers';
import { newId } from '@/lib/id';
import { nowIso } from '@/lib/time';

export async function listGroups(db: AppDB): Promise<Group[]> {
  return db
    .select()
    .from(groups)
    .where(notDeleted(groups.deletedAt))
    .orderBy(asc(groups.sortOrder), asc(groups.name));
}

export async function getGroup(db: AppDB, id: string): Promise<Group | null> {
  const rows = await db
    .select()
    .from(groups)
    .where(and(eq(groups.id, id), notDeleted(groups.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createGroup(
  db: AppDB,
  data: Omit<NewGroup, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
): Promise<Group> {
  const now = nowIso();
  const id = newId();
  await db.insert(groups).values({ ...data, id, createdAt: now, updatedAt: now });
  return (await getGroup(db, id))!;
}

export async function updateGroup(
  db: AppDB,
  id: string,
  data: Partial<Omit<NewGroup, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
): Promise<void> {
  await db
    .update(groups)
    .set({ ...touch(), ...data })
    .where(and(eq(groups.id, id), notDeleted(groups.deletedAt)));
}

export async function softDeleteGroup(db: AppDB, id: string): Promise<void> {
  await db
    .update(groups)
    .set(softDelete())
    .where(and(eq(groups.id, id), isNull(groups.deletedAt)));
}
