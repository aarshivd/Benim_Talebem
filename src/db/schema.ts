/**
 * src/db/schema.ts
 * Drizzle ORM — expo-sqlite şeması (sqlite-core).
 *
 * Kurallar:
 *  - Her tabloda: id (UUID PK), created_at, updated_at, deleted_at (soft delete)
 *  - Gün alanları 'YYYY-MM-DD' text; zaman damgaları ISO string
 *  - settings tablosu farklı: key PK, value, updated_at
 */

import {
  sqliteTable,
  text,
  integer,
  index,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── ORTAK SÜTUNLAR ─────────────────────────────────────────────────────────

const baseColumns = {
  id: text('id').primaryKey(),
  createdAt: text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  deletedAt: text('deleted_at'),
};

// ─── GROUPS ──────────────────────────────────────────────────────────────────

export const groups = sqliteTable(
  'groups',
  {
    ...baseColumns,
    name: text('name').notNull(),
    level: text('level', {
      enum: ['ilkokul', 'ortaokul', 'lise', 'universite'],
    }).notNull(),
    color: integer('color').notNull().default(0), // GroupPalette index
    emoji: text('emoji').notNull().default('📚'),
    isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('groups_deleted_at_idx').on(t.deletedAt)],
);

// ─── STUDENTS ────────────────────────────────────────────────────────────────

export const students = sqliteTable(
  'students',
  {
    ...baseColumns,
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    avatar: text('avatar'), // emoji, opsiyonel
    grade: text('grade'),   // sınıf, opsiyonel
    note: text('note'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  },
  (t) => [
    index('students_group_id_idx').on(t.groupId),
    index('students_deleted_at_idx').on(t.deletedAt),
  ],
);

// ─── BOOKS ───────────────────────────────────────────────────────────────────

export const books = sqliteTable(
  'books',
  {
    ...baseColumns,
    title: text('title').notNull(),
    author: text('author'),
    totalPages: integer('total_pages').notNull(), // ≥ 1
  },
  (t) => [index('books_deleted_at_idx').on(t.deletedAt)],
);

// ─── STUDENT_BOOKS ───────────────────────────────────────────────────────────

export const studentBooks = sqliteTable(
  'student_books',
  {
    ...baseColumns,
    studentId: text('student_id')
      .notNull()
      .references(() => students.id),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id),
    currentPage: integer('current_page').notNull().default(0),
    status: text('status', {
      enum: ['reading', 'finished', 'paused'],
    })
      .notNull()
      .default('reading'),
    startedOn: text('started_on'), // 'YYYY-MM-DD'
    finishedOn: text('finished_on'),
  },
  (t) => [
    // Benzersiz: (student_id, book_id) — kısmi indeks (deleted_at NULL) migration'a eklenir
    index('student_books_student_id_idx').on(t.studentId),
    index('student_books_book_id_idx').on(t.bookId),
    index('student_books_deleted_at_idx').on(t.deletedAt),
  ],
);

// ─── READING_LOGS ────────────────────────────────────────────────────────────

export const readingLogs = sqliteTable(
  'reading_logs',
  {
    ...baseColumns,
    studentId: text('student_id')
      .notNull()
      .references(() => students.id),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id),
    date: text('date').notNull(), // 'YYYY-MM-DD'
    fromPage: integer('from_page').notNull(),
    toPage: integer('to_page').notNull(),
    pagesRead: integer('pages_read').notNull(),
  },
  (t) => [
    index('reading_logs_student_date_idx').on(t.studentId, t.date),
    index('reading_logs_student_id_idx').on(t.studentId),
    index('reading_logs_deleted_at_idx').on(t.deletedAt),
  ],
);

// ─── POINT_RULES ─────────────────────────────────────────────────────────────

export const pointRules = sqliteTable(
  'point_rules',
  {
    ...baseColumns,
    name: text('name').notNull(),
    points: integer('points').notNull(),
    category: text('category', {
      enum: ['soru', 'davranis', 'gorev', 'ozel'],
    }).notNull(),
    icon: text('icon').notNull().default('⭐'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('point_rules_deleted_at_idx').on(t.deletedAt)],
);

// ─── POINT_EVENTS ────────────────────────────────────────────────────────────

export const pointEvents = sqliteTable(
  'point_events',
  {
    ...baseColumns,
    studentId: text('student_id')
      .notNull()
      .references(() => students.id),
    ruleId: text('rule_id').references(() => pointRules.id),
    title: text('title').notNull(), // kural adının anlık kopyası veya serbest başlık
    points: integer('points').notNull(),
    date: text('date').notNull(), // 'YYYY-MM-DD'
    note: text('note'),
    source: text('source', { enum: ['manual', 'reading'] })
      .notNull()
      .default('manual'),
  },
  (t) => [
    index('point_events_student_date_idx').on(t.studentId, t.date),
    index('point_events_date_idx').on(t.date),
    index('point_events_student_id_idx').on(t.studentId),
    index('point_events_deleted_at_idx').on(t.deletedAt),
    // Kısmi benzersiz indeks (source='reading' ve deleted_at NULL):
    // Drizzle bu tür kısmi indeksi .on() API ile desteklemez; migration SQL'e ekliyoruz.
  ],
);

// ─── TERMS ───────────────────────────────────────────────────────────────────

export const terms = sqliteTable(
  'terms',
  {
    ...baseColumns,
    name: text('name').notNull(),
    startDate: text('start_date').notNull(), // 'YYYY-MM-DD'
    endDate: text('end_date').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [index('terms_deleted_at_idx').on(t.deletedAt)],
);

// ─── REWARDS ─────────────────────────────────────────────────────────────────

export const rewards = sqliteTable(
  'rewards',
  {
    ...baseColumns,
    name: text('name').notNull(),
    description: text('description'),
    icon: text('icon').notNull().default('🏆'),
    scope: text('scope', { enum: ['daily', 'term'] }).notNull(),
    kind: text('kind', { enum: ['points', 'rank'] }).notNull(),
    targetPoints: integer('target_points'),
    rankTop: integer('rank_top'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  },
  (t) => [index('rewards_deleted_at_idx').on(t.deletedAt)],
);

// ─── SETTINGS ────────────────────────────────────────────────────────────────
// Settings tablosunun yapısı farklı: key PK, value (JSON string), updated_at

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(), // JSON string
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

// ─── TİP ÇIKARIMI ────────────────────────────────────────────────────────────

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;

export type StudentBook = typeof studentBooks.$inferSelect;
export type NewStudentBook = typeof studentBooks.$inferInsert;

export type ReadingLog = typeof readingLogs.$inferSelect;
export type NewReadingLog = typeof readingLogs.$inferInsert;

export type PointRule = typeof pointRules.$inferSelect;
export type NewPointRule = typeof pointRules.$inferInsert;

export type PointEvent = typeof pointEvents.$inferSelect;
export type NewPointEvent = typeof pointEvents.$inferInsert;

export type Term = typeof terms.$inferSelect;
export type NewTerm = typeof terms.$inferInsert;

export type Reward = typeof rewards.$inferSelect;
export type NewReward = typeof rewards.$inferInsert;

export type Setting = typeof settings.$inferSelect;
