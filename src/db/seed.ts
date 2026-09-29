/**
 * src/db/seed.ts
 * İdempotent seed — ilk kurulumda varsayılan ayarlar ve puan kurallarını ekler.
 * İkinci çalışmada zaten varsa atlar (onConflictDoNothing).
 */

import type { AppDB } from '@/db/client';
import { settings, pointRules } from '@/db/schema';
import { DEFAULT_SETTINGS } from '@/db/repositories/settings';
import { newId } from '@/lib/id';
import { nowIso } from '@/lib/time';

const SEED_FLAG_KEY = '__seed_v1__';

/** Seed'in çalışıp çalışmadığını kontrol eder ve gerekirse çalıştırır. */
export async function runSeedIfNeeded(db: AppDB): Promise<void> {
  // Seed daha önce çalıştı mı?
  const flagRows = await db
    .select()
    .from(settings)
    .where(
      (await import('drizzle-orm')).eq(settings.key, SEED_FLAG_KEY),
    )
    .limit(1);

  if (flagRows.length > 0) {
    // Seed zaten çalışmış
    return;
  }

  const now = nowIso();

  await db.transaction(async (tx) => {
    // ── Varsayılan ayarlar ───────────────────────────────────────────────
    const settingEntries = Object.entries(DEFAULT_SETTINGS) as [
      keyof typeof DEFAULT_SETTINGS,
      unknown,
    ][];

    for (const [key, value] of settingEntries) {
      await tx
        .insert(settings)
        .values({ key, value: JSON.stringify(value), updatedAt: now })
        .onConflictDoNothing();
    }

    // ── Varsayılan puan kuralları (AGENTS.md) ────────────────────────────
    const defaultRules: {
      name: string;
      points: number;
      category: 'soru' | 'davranis' | 'gorev' | 'ozel';
      icon: string;
      sortOrder: number;
    }[] = [
      {
        name: 'Soruya doğru cevap',
        points: 5,
        category: 'soru',
        icon: '✅',
        sortOrder: 0,
      },
      {
        name: 'Uslu durdu',
        points: 3,
        category: 'davranis',
        icon: '😊',
        sortOrder: 1,
      },
      {
        name: 'Derse hazırlıklı',
        points: 2,
        category: 'davranis',
        icon: '📖',
        sortOrder: 2,
      },
      {
        name: 'Ek görev',
        points: 10,
        category: 'gorev',
        icon: '🎯',
        sortOrder: 3,
      },
    ];

    for (const rule of defaultRules) {
      await tx
        .insert(pointRules)
        .values({
          id: newId(),
          name: rule.name,
          points: rule.points,
          category: rule.category,
          icon: rule.icon,
          isActive: true,
          sortOrder: rule.sortOrder,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing();
    }

    // ── Seed bayrak kaydı ────────────────────────────────────────────────
    await tx
      .insert(settings)
      .values({ key: SEED_FLAG_KEY, value: JSON.stringify(true), updatedAt: now })
      .onConflictDoNothing();
  });
}
