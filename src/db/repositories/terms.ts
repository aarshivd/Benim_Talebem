/**
 * src/db/repositories/terms.ts
 */

import { eq, and, isNull } from 'drizzle-orm';
import type { AppDB } from '@/db/client';
import { terms } from '@/db/schema';
import type { NewTerm, Term } from '@/db/schema';
import { notDeleted, softDelete, touch, withTransaction } from '@/db/helpers';
import { newId } from '@/lib/id';
import { nowIso } from '@/lib/time';

export async function getActiveTerm(db: AppDB): Promise<Term | null> {
  const rows = await db
    .select()
    .from(terms)
    .where(
      and(
        eq(terms.isActive, true),
        notDeleted(terms.deletedAt),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function listTerms(db: AppDB): Promise<Term[]> {
  return db
    .select()
    .from(terms)
    .where(notDeleted(terms.deletedAt))
    .orderBy(terms.startDate);
}

export async function getTerm(db: AppDB, id: string): Promise<Term | null> {
  const rows = await db
    .select()
    .from(terms)
    .where(and(eq(terms.id, id), notDeleted(terms.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createTerm(
  db: AppDB,
  data: Omit<NewTerm, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
): Promise<Term> {
  const now = nowIso();
  const id = newId();
  await db.insert(terms).values({ ...data, id, createdAt: now, updatedAt: now });
  return (await getTerm(db, id))!;
}

export async function updateTerm(
  db: AppDB,
  id: string,
  data: Partial<Omit<NewTerm, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
): Promise<void> {
  await db
    .update(terms)
    .set({ ...touch(), ...data })
    .where(and(eq(terms.id, id), notDeleted(terms.deletedAt)));
}

export async function softDeleteTerm(db: AppDB, id: string): Promise<void> {
  await db
    .update(terms)
    .set(softDelete())
    .where(and(eq(terms.id, id), isNull(terms.deletedAt)));
}

/**
 * Belirtilen dönemi aktif yapar; diğer tüm dönemleri pasif eder.
 * Transaction içinde çalışır — yalnızca bir dönem aktif olabilir.
 */
export async function setActiveTerm(db: AppDB, id: string): Promise<void> {
  await withTransaction(db, async (tx) => {
    // Önce tüm dönemleri devre dışı bırak
    await tx
      .update(terms)
      .set({ isActive: false, updatedAt: nowIso() })
      .where(notDeleted(terms.deletedAt));

    // Sonra seçileni aktif yap
    await tx
      .update(terms)
      .set({ isActive: true, updatedAt: nowIso() })
      .where(and(eq(terms.id, id), notDeleted(terms.deletedAt)));
  });
}
