/**
 * src/db/client.ts
 * SQLite bağlantısı — PRAGMA ayarları + Drizzle ORM örneği.
 *
 * NOT: Bu dosya uygulama başladığında bir kez import edilir.
 * Migration DbProvider.tsx içinde yapılır.
 */

import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const DB_NAME = 'okuma_yildizi.db';

// ─── SQLite bağlantısı ────────────────────────────────────────────────────────

const rawDb = openDatabaseSync(DB_NAME, { enableChangeListener: true });

// PRAGMA ayarları — yabancı anahtar kısıtları + WAL modu
rawDb.execSync('PRAGMA foreign_keys = ON;');
rawDb.execSync('PRAGMA journal_mode = WAL;');
rawDb.execSync('PRAGMA synchronous = NORMAL;');

// ─── Drizzle ORM örneği ───────────────────────────────────────────────────────

export const db = drizzle(rawDb, { schema });
export type AppDB = typeof db;
