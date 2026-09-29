/**
 * src/db/helpers.ts
 * Drizzle sorgu yardımcıları.
 */

import { isNull, sql } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import type * as schema from './schema';
import { nowIso } from '@/lib/time';

type DB = ExpoSQLiteDatabase<typeof schema>;

// ─── notDeleted ───────────────────────────────────────────────────────────────

/**
 * deleted_at IS NULL filtresini döndürür.
 * Kullanım: .where(notDeleted(table.deletedAt))
 */
export function notDeleted(deletedAtColumn: Parameters<typeof isNull>[0]) {
  return isNull(deletedAtColumn);
}

// ─── softDelete ───────────────────────────────────────────────────────────────

/**
 * Verilen değerleri soft-delete için hazırlar.
 * Kullanım: db.update(table).set(softDelete()).where(...)
 */
export function softDelete() {
  return {
    deletedAt: nowIso(),
    updatedAt: nowIso(),
  };
}

// ─── touch ────────────────────────────────────────────────────────────────────

/**
 * updated_at'i günceller.
 * Kullanım: db.update(table).set({ ...touch(), ...changes }).where(...)
 */
export function touch() {
  return {
    updatedAt: nowIso(),
  };
}

// ─── withTransaction ─────────────────────────────────────────────────────────

/**
 * Birden fazla tabloya yazan işlemleri transaction içinde çalıştırır.
 * Hata olursa otomatik rollback yapılır.
 *
 * @example
 * await withTransaction(db, async (tx) => {
 *   await tx.insert(students).values(...);
 *   await tx.update(groups).set(...).where(...);
 * });
 */
export async function withTransaction<T>(
  db: DB,
  fn: (tx: Parameters<Parameters<DB['transaction']>[0]>[0]) => Promise<T>,
): Promise<T> {
  return db.transaction(fn);
}

// ─── SQL yardımcıları ─────────────────────────────────────────────────────────

/** SQLite COALESCE — null yerine varsayılan değer döndürür */
export function coalesce<T>(expr: Parameters<typeof sql>[0], defaultVal: T) {
  return sql<T>`COALESCE(${expr}, ${defaultVal})`;
}
