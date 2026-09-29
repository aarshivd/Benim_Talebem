/**
 * src/db/repositories/books.ts
 */

import { eq, and, isNull } from 'drizzle-orm';
import type { AppDB } from '@/db/client';
import { books } from '@/db/schema';
import type { NewBook, Book } from '@/db/schema';
import { notDeleted, softDelete, touch } from '@/db/helpers';
import { newId } from '@/lib/id';
import { nowIso } from '@/lib/time';

export async function listBooks(db: AppDB): Promise<Book[]> {
  return db
    .select()
    .from(books)
    .where(notDeleted(books.deletedAt))
    .orderBy(books.title);
}

export async function getBook(db: AppDB, id: string): Promise<Book | null> {
  const rows = await db
    .select()
    .from(books)
    .where(and(eq(books.id, id), notDeleted(books.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createBook(
  db: AppDB,
  data: Omit<NewBook, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
): Promise<Book> {
  const now = nowIso();
  const id = newId();
  await db.insert(books).values({ ...data, id, createdAt: now, updatedAt: now });
  return (await getBook(db, id))!;
}

export async function updateBook(
  db: AppDB,
  id: string,
  data: Partial<Omit<NewBook, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
): Promise<void> {
  await db
    .update(books)
    .set({ ...touch(), ...data })
    .where(and(eq(books.id, id), notDeleted(books.deletedAt)));
}

export async function softDeleteBook(db: AppDB, id: string): Promise<void> {
  await db
    .update(books)
    .set(softDelete())
    .where(and(eq(books.id, id), isNull(books.deletedAt)));
}
