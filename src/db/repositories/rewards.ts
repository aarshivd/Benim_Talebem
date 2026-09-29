/**
 * src/db/repositories/rewards.ts
 */

import { eq, and, isNull } from 'drizzle-orm';
import type { AppDB } from '@/db/client';
import { rewards } from '@/db/schema';
import type { NewReward, Reward } from '@/db/schema';
import { notDeleted, softDelete, touch } from '@/db/helpers';
import { newId } from '@/lib/id';
import { nowIso } from '@/lib/time';

export async function listRewards(db: AppDB): Promise<Reward[]> {
  return db
    .select()
    .from(rewards)
    .where(notDeleted(rewards.deletedAt))
    .orderBy(rewards.scope, rewards.kind, rewards.name);
}

export async function getReward(db: AppDB, id: string): Promise<Reward | null> {
  const rows = await db
    .select()
    .from(rewards)
    .where(and(eq(rewards.id, id), notDeleted(rewards.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createReward(
  db: AppDB,
  data: Omit<NewReward, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
): Promise<Reward> {
  const now = nowIso();
  const id = newId();
  await db.insert(rewards).values({ ...data, id, createdAt: now, updatedAt: now });
  return (await getReward(db, id))!;
}

export async function updateReward(
  db: AppDB,
  id: string,
  data: Partial<Omit<NewReward, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
): Promise<void> {
  await db
    .update(rewards)
    .set({ ...touch(), ...data })
    .where(and(eq(rewards.id, id), notDeleted(rewards.deletedAt)));
}

export async function softDeleteReward(db: AppDB, id: string): Promise<void> {
  await db
    .update(rewards)
    .set(softDelete())
    .where(and(eq(rewards.id, id), isNull(rewards.deletedAt)));
}
