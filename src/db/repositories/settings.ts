/**
 * src/db/repositories/settings.ts
 * Ayar key-value deposu. Value JSON string'e seri hale getirilir.
 */

import { eq } from 'drizzle-orm';
import type { AppDB } from '@/db/client';
import { settings } from '@/db/schema';
import { nowIso } from '@/lib/time';

// ─── AppSettings tip tanımı ───────────────────────────────────────────────────

export interface AppSettings {
  /** Her kaç sayfada bir puan verilir (varsayılan: 10) */
  pages_per_point: number;
  /** Günlük hedef sayfa (0 = devre dışı) */
  daily_goal_pages: number;
  /** Günlük hedefe ulaşılınca ekstra puan */
  daily_goal_bonus: number;
  /** Eksi puana izin ver */
  allow_negative_points: boolean;
  /** Otomatik kilit (saniye, 0 = devre dışı) */
  auto_lock_seconds: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  pages_per_point: 10,
  daily_goal_pages: 20,
  daily_goal_bonus: 5,
  allow_negative_points: false,
  auto_lock_seconds: 60,
};

// ─── Repository fonksiyonları ────────────────────────────────────────────────

/**
 * Belirtilen anahtarın değerini döndürür.
 * Kayıt yoksa veya parse edilemezse defaultValue döner.
 */
export async function getSetting<T>(
  db: AppDB,
  key: keyof AppSettings,
  defaultValue: T,
): Promise<T> {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  if (row.length === 0 || row[0].value === undefined) return defaultValue;

  try {
    return JSON.parse(row[0].value) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Belirtilen anahtarın değerini JSON string olarak kaydeder.
 */
export async function setSetting<T>(
  db: AppDB,
  key: keyof AppSettings,
  value: T,
): Promise<void> {
  const jsonValue = JSON.stringify(value);
  await db
    .insert(settings)
    .values({ key, value: jsonValue, updatedAt: nowIso() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: jsonValue, updatedAt: nowIso() },
    });
}

/**
 * Tüm ayarları AppSettings formatında döndürür.
 * Eksik ayarlar için varsayılan değerler kullanılır.
 */
export async function getAllSettings(db: AppDB): Promise<AppSettings> {
  const rows = await db.select().from(settings);
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }

  const parse = <T>(key: keyof AppSettings, def: T): T => {
    if (!(key in map)) return def;
    try {
      return JSON.parse(map[key]) as T;
    } catch {
      return def;
    }
  };

  return {
    pages_per_point: parse('pages_per_point', DEFAULT_SETTINGS.pages_per_point),
    daily_goal_pages: parse('daily_goal_pages', DEFAULT_SETTINGS.daily_goal_pages),
    daily_goal_bonus: parse('daily_goal_bonus', DEFAULT_SETTINGS.daily_goal_bonus),
    allow_negative_points: parse('allow_negative_points', DEFAULT_SETTINGS.allow_negative_points),
    auto_lock_seconds: parse('auto_lock_seconds', DEFAULT_SETTINGS.auto_lock_seconds),
  };
}
