/**
 * src/features/points/service.ts
 *
 * Puan verme servisi.
 */

import { eq } from 'drizzle-orm';
import type { AppDB } from '@/db/client';
import { pointEvents } from '@/db/schema';
import { notDeleted, softDelete, touch } from '@/db/helpers';
import { newId } from '@/lib/id';
import { nowIso } from '@/lib/time';
import { getAllSettings } from '@/db/repositories/settings';
import { validateManualPoints } from '@/domain';

export interface GiveManualPointsInput {
  studentIds: string[];
  ruleId?: string;
  points: number;
  title: string;
  note?: string;
  date: string;
}

export async function giveManualPoints(
  db: AppDB,
  input: GiveManualPointsInput,
): Promise<string[]> {
  const settings = await getAllSettings(db);

  const validation = validateManualPoints({
    points: input.points,
    allowNegative: settings.allow_negative_points,
  });

  if (!validation) {
    throw new Error('Geçersiz puan veya eksi puana izin verilmiyor.');
  }

  const now = nowIso();
  const eventIds: string[] = [];

  await db.transaction(async (tx) => {
    for (const studentId of input.studentIds) {
      const id = newId();
      eventIds.push(id);
      await tx.insert(pointEvents).values({
        id,
        studentId,
        ruleId: input.ruleId,
        date: input.date,
        points: input.points,
        title: input.title,
        source: 'manual',
        note: input.note || null,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  return eventIds;
}

export async function undoManualPoints(
  db: AppDB,
  eventIds: string[],
): Promise<void> {
  if (eventIds.length === 0) return;
  await db.transaction(async (tx) => {
    for (const id of eventIds) {
      await tx
        .update(pointEvents)
        .set(softDelete())
        .where(eq(pointEvents.id, id));
    }
  });
}
