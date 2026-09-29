/**
 * src/db/repositories/pointRules.ts
 */

import { eq, and, isNull, asc } from 'drizzle-orm';
import type { AppDB } from '@/db/client';
import { pointRules } from '@/db/schema';
import type { NewPointRule, PointRule } from '@/db/schema';
import { notDeleted, softDelete, touch } from '@/db/helpers';
import { newId } from '@/lib/id';
import { nowIso } from '@/lib/time';

export async function listPointRules(db: AppDB): Promise<PointRule[]> {
  return db
    .select()
    .from(pointRules)
    .where(notDeleted(pointRules.deletedAt))
    .orderBy(asc(pointRules.sortOrder), asc(pointRules.name));
}

export async function getPointRule(db: AppDB, id: string): Promise<PointRule | null> {
  const rows = await db
    .select()
    .from(pointRules)
    .where(and(eq(pointRules.id, id), notDeleted(pointRules.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createPointRule(
  db: AppDB,
  data: Omit<NewPointRule, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
): Promise<PointRule> {
  const now = nowIso();
  const id = newId();
  await db.insert(pointRules).values({ ...data, id, createdAt: now, updatedAt: now });
  return (await getPointRule(db, id))!;
}

export async function updatePointRule(
  db: AppDB,
  id: string,
  data: Partial<Omit<NewPointRule, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
): Promise<void> {
  await db
    .update(pointRules)
    .set({ ...touch(), ...data })
    .where(and(eq(pointRules.id, id), notDeleted(pointRules.deletedAt)));
}

export async function softDeletePointRule(db: AppDB, id: string): Promise<void> {
  await db
    .update(pointRules)
    .set(softDelete())
    .where(and(eq(pointRules.id, id), isNull(pointRules.deletedAt)));
}
