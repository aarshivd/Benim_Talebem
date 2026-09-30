/**
 * src/features/reading/service.ts
 *
 * Okuma kaydı iş mantığı — TEK transaction'da:
 *   1. reading_log ekle / güncelle / sil
 *   2. student_books.current_page ve status güncelle  (domain.nextStatus)
 *   3. O günün okuma puanını yeniden hesapla          (domain.calcReadingPoints)
 *      → upsertReadingEvent (0 puan ise soft-delete)
 *
 * Hiçbir fonksiyon DB'yi doğrudan import etmez — çağıran AppDB geçirir.
 * Domain fonksiyonları: validateReadingEntry, calcReadingPoints, nextStatus, calcCurrentPage
 */

import { eq, and } from 'drizzle-orm';
import type { AppDB } from '@/db/client';
import { readingLogs, studentBooks } from '@/db/schema';
import {
  createReadingLog,
  softDeleteReadingLog,
  updateReadingLog,
  sumPagesByStudentDay,
  listByStudentBook,
} from '@/db/repositories/readingLogs';
import {
  getPair,
  createStudentBook,
  updateStudentBook,
  getStudentBook,
} from '@/db/repositories/studentBooks';
import { upsertReadingEvent } from '@/db/repositories/pointEvents';
import { getAllSettings } from '@/db/repositories/settings';
import { notDeleted, softDelete, touch } from '@/db/helpers';
import { newId } from '@/lib/id';
import { nowIso } from '@/lib/time';
import {
  validateReadingEntry,
  calcReadingPoints,
  nextStatus,
} from '@/domain';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RecordReadingInput {
  studentId: string;
  bookId: string;
  bookTotalPages: number;
  toPage: number;
  date: string; // 'YYYY-MM-DD'
}

export interface RecordReadingResult {
  pagesRead: number;
  pointsAwarded: number;
  dailyTotal: number;
  finished: boolean;
  logId: string;
}

// ─── Validation helper ───────────────────────────────────────────────────────

const VALIDATION_MESSAGES: Record<string, string> = {
  EMPTY: 'Okunacak sayfa yok — girilen sayfa şu anki konumla aynı.',
  BACKWARDS: 'Sayfa numarası geriye gidemez.',
  EXCEEDS_TOTAL: 'Girilen sayfa kitabın toplam sayfa sayısını aşıyor.',
  INVALID: 'Geçersiz sayfa numarası.',
};

export function readingValidationMessage(code: string): string {
  return VALIDATION_MESSAGES[code] ?? 'Geçersiz giriş.';
}

// ─── Core service ────────────────────────────────────────────────────────────

/**
 * Tüm okuma kaydı mantığını tek transaction'da yürütür.
 * Dönen RecordReadingResult'ı UI kutlaması için kullanır.
 */
export async function recordReading(
  db: AppDB,
  input: RecordReadingInput,
): Promise<RecordReadingResult> {
  const { studentId, bookId, bookTotalPages, toPage, date } = input;

  // student_books kaydını al ya da oluştur
  let sb = await getPair(db, studentId, bookId);
  const fromPage = sb?.currentPage ?? 0;

  // Domain doğrulaması
  const validation = validateReadingEntry({ fromPage, toPage, totalPages: bookTotalPages });
  if (!validation.ok) {
    throw new Error(readingValidationMessage(validation.code));
  }

  const pagesRead = toPage - fromPage;
  const newStatus = nextStatus(toPage, bookTotalPages);
  const finishedOn = newStatus === 'finished' ? date : null;

  let logId = '';

  await db.transaction(async (tx) => {
    const now = nowIso();

    // 1. reading_log ekle
    const id = newId();
    await tx.insert(readingLogs).values({
      id,
      studentId,
      bookId,
      date,
      fromPage,
      toPage,
      pagesRead,
      createdAt: now,
      updatedAt: now,
    });
    logId = id;

    // 2. student_books güncelle
    if (sb) {
      await tx
        .update(studentBooks)
        .set({
          ...touch(),
          currentPage: toPage,
          status: newStatus,
          ...(finishedOn ? { finishedOn } : {}),
        })
        .where(and(eq(studentBooks.id, sb.id), notDeleted(studentBooks.deletedAt)));
    } else {
      const sbId = newId();
      await tx.insert(studentBooks).values({
        id: sbId,
        studentId,
        bookId,
        currentPage: toPage,
        status: newStatus,
        startedOn: date,
        finishedOn,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  // 3. O günün okuma puanını yeniden hesapla (transaction dışında, tüm kayıtları görmek için)
  const pointsAwarded = await recomputeReadingPoints(db, studentId, date);
  const dailyTotal = await sumPagesByStudentDay(db, studentId, date);

  return {
    pagesRead,
    pointsAwarded,
    dailyTotal,
    finished: newStatus === 'finished',
    logId,
  };
}

/**
 * O günün toplam sayfasını hesaplayıp puan event'i upsert eder.
 * Döner: hesaplanan puan (0 dahil).
 */
export async function recomputeReadingPoints(
  db: AppDB,
  studentId: string,
  day: string,
): Promise<number> {
  const settings = await getAllSettings(db);
  const dailyPages = await sumPagesByStudentDay(db, studentId, day);

  const points = calcReadingPoints({
    dailyPages,
    pagesPerPoint: settings.pages_per_point,
    goalPages: settings.daily_goal_pages,
    goalBonus: settings.daily_goal_bonus,
  });

  const title = `Okuma — ${dailyPages} sayfa`;
  await upsertReadingEvent(db, studentId, day, points, title);

  return points;
}

/**
 * Son kaydı sildikten sonra student_books'u ve o günün puanını günceller.
 */
export async function deleteLastLog(
  db: AppDB,
  logId: string,
): Promise<void> {
  // Log'u al
  const logRows = await db
    .select()
    .from(readingLogs)
    .where(and(eq(readingLogs.id, logId), notDeleted(readingLogs.deletedAt)))
    .limit(1);
  const log = logRows[0];
  if (!log) return;

  const { studentId, bookId, fromPage, date } = log;

  // student_books'u bul
  const sbRows = await db
    .select()
    .from(studentBooks)
    .where(
      and(
        eq(studentBooks.studentId, studentId),
        eq(studentBooks.bookId, bookId),
        notDeleted(studentBooks.deletedAt),
      ),
    )
    .limit(1);
  const sb = sbRows[0];

  await db.transaction(async (tx) => {
    const now = nowIso();

    // 1. Log'u soft-delete et
    await tx
      .update(readingLogs)
      .set(softDelete())
      .where(eq(readingLogs.id, logId));

    // 2. student_books'u bir önceki sayfaya döndür
    if (sb) {
      const newStatus = nextStatus(fromPage, sb.currentPage > 0 ? sb.currentPage : 1);
      await tx
        .update(studentBooks)
        .set({
          ...touch(),
          currentPage: fromPage,
          status: fromPage === 0 ? 'reading' : nextStatus(fromPage, sb.currentPage),
          finishedOn: null,
        })
        .where(eq(studentBooks.id, sb.id));
    }
  });

  // 3. Puanı yeniden hesapla
  await recomputeReadingPoints(db, studentId, date);
}

/**
 * Son kaydı düzenler (sadece toPage değişebilir).
 */
export async function editLastLog(
  db: AppDB,
  logId: string,
  newToPage: number,
  bookTotalPages: number,
): Promise<number> {
  const logRows = await db
    .select()
    .from(readingLogs)
    .where(and(eq(readingLogs.id, logId), notDeleted(readingLogs.deletedAt)))
    .limit(1);
  const log = logRows[0];
  if (!log) throw new Error('Kayıt bulunamadı.');

  const { studentId, bookId, fromPage, date } = log;

  const validation = validateReadingEntry({
    fromPage,
    toPage: newToPage,
    totalPages: bookTotalPages,
  });
  if (!validation.ok) {
    throw new Error(readingValidationMessage(validation.code));
  }

  const pagesRead = newToPage - fromPage;
  const newStatus = nextStatus(newToPage, bookTotalPages);
  const finishedOn = newStatus === 'finished' ? date : null;

  // student_books
  const sbRows = await db
    .select()
    .from(studentBooks)
    .where(
      and(
        eq(studentBooks.studentId, studentId),
        eq(studentBooks.bookId, bookId),
        notDeleted(studentBooks.deletedAt),
      ),
    )
    .limit(1);
  const sb = sbRows[0];

  await db.transaction(async (tx) => {
    const now = nowIso();

    await tx
      .update(readingLogs)
      .set({
        toPage: newToPage,
        pagesRead,
        updatedAt: now,
      })
      .where(eq(readingLogs.id, logId));

    if (sb) {
      await tx
        .update(studentBooks)
        .set({
          ...touch(),
          currentPage: newToPage,
          status: newStatus,
          finishedOn,
        })
        .where(eq(studentBooks.id, sb.id));
    }
  });

  return await recomputeReadingPoints(db, studentId, date);
}
