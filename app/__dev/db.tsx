/**
 * app/__dev/db.tsx
 * Yalnızca __DEV__ ortamında erişilebilir veri katmanı duman testleri.
 * Her test başlığının yanında ✅ GEÇTI veya ❌ KALDI yazar.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Text } from '@/components/ui';
import { db } from '@/db/client';
import { books, pointEvents } from '@/db/schema';
import { withTransaction } from '@/db/helpers';
import * as groupsRepo from '@/db/repositories/groups';
import * as studentsRepo from '@/db/repositories/students';
import * as booksRepo from '@/db/repositories/books';
import * as studentBooksRepo from '@/db/repositories/studentBooks';
import * as readingLogsRepo from '@/db/repositories/readingLogs';
import * as pointEventsRepo from '@/db/repositories/pointEvents';
import * as termsRepo from '@/db/repositories/terms';
import * as settingsRepo from '@/db/repositories/settings';
import { todayLocal } from '@/lib/time';
import { eq, and, isNull } from 'drizzle-orm';

if (!__DEV__) {
  throw new Error('DB test ekranı yalnızca geliştirme modunda erişilebilir.');
}

// ─── Test çerçevesi ──────────────────────────────────────────────────────────

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

async function run(
  name: string,
  fn: () => Promise<void>,
): Promise<TestResult> {
  try {
    await fn();
    return { name, passed: true };
  } catch (err) {
    return { name, passed: false, error: String(err) };
  }
}

// ─── TESTLER ─────────────────────────────────────────────────────────────────

async function runAllTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const today = todayLocal();

  // Test veritabanını temizle (sadece test verileri)
  // Prefix ile test kayıtlarını ayırt edeceğiz
  const TEST_GROUP_NAME = '__TEST_GROUP__';
  const TEST_BOOK_TITLE = '__TEST_KITAP__';

  let groupId = '';
  let studentId = '';
  let bookId = '';
  let sbId = '';

  // ── 1. Grup oluştur ──────────────────────────────────────────────────────
  results.push(await run('Grup oluştur', async () => {
    const g = await groupsRepo.createGroup(db, {
      name: TEST_GROUP_NAME,
      level: 'ortaokul',
      color: 0,
      emoji: '📚',
      isArchived: false,
      sortOrder: 99,
    });
    if (!g.id) throw new Error('id yok');
    groupId = g.id;
  }));

  // ── 2. Öğrenci oluştur ───────────────────────────────────────────────────
  results.push(await run('Öğrenci oluştur', async () => {
    const s = await studentsRepo.createStudent(db, {
      groupId,
      firstName: 'Test',
      lastName: 'Talebe',
      isActive: true,
    });
    if (!s.id) throw new Error('id yok');
    studentId = s.id;
  }));

  // ── 3. Kitap oluştur ─────────────────────────────────────────────────────
  results.push(await run('Kitap oluştur', async () => {
    const b = await booksRepo.createBook(db, {
      title: TEST_BOOK_TITLE,
      totalPages: 200,
    });
    if (!b.id) throw new Error('id yok');
    bookId = b.id;
  }));

  // ── 4. Öğrenci-Kitap eşleştir ────────────────────────────────────────────
  results.push(await run('Öğrenci-Kitap eşleştir', async () => {
    const sb = await studentBooksRepo.createStudentBook(db, {
      studentId,
      bookId,
      currentPage: 0,
      status: 'reading',
      startedOn: today,
    });
    if (!sb.id) throw new Error('id yok');
    sbId = sb.id;
  }));

  // ── 5. Benzersiz kısıt ihlali (aynı student+book) ────────────────────────
  results.push(await run('Benzersiz kısıt ihlali (student+book)', async () => {
    let threw = false;
    try {
      await studentBooksRepo.createStudentBook(db, {
        studentId,
        bookId,
        currentPage: 0,
        status: 'reading',
        startedOn: today,
      });
    } catch {
      threw = true;
    }
    if (!threw) throw new Error('Kısıt ihlali bekleniyor, hata gelmedi');
  }));

  // ── 6. Okuma kaydı ekle ──────────────────────────────────────────────────
  results.push(await run('Okuma kaydı ekle', async () => {
    const log = await readingLogsRepo.createReadingLog(db, {
      studentId,
      bookId,
      date: today,
      fromPage: 0,
      toPage: 30,
      pagesRead: 30,
    });
    if (!log.id) throw new Error('id yok');

    // currentPage güncelle
    await studentBooksRepo.updateStudentBook(db, sbId, { currentPage: 30 });
  }));

  // ── 7. Günlük toplam sayfa ───────────────────────────────────────────────
  results.push(await run('Günlük toplam sayfa', async () => {
    const total = await readingLogsRepo.sumPagesByStudentDay(db, studentId, today);
    if (total !== 30) throw new Error(`Beklenen 30, gelen ${total}`);
  }));

  // ── 8. Okuma puanı upsert ────────────────────────────────────────────────
  results.push(await run('Okuma puanı upsert', async () => {
    await pointEventsRepo.upsertReadingEvent(db, studentId, today, 3, 'Okuma puanı');
    const evts = await db.select().from(pointEvents)
      .where(and(eq(pointEvents.studentId, studentId), eq(pointEvents.source, 'reading'), isNull(pointEvents.deletedAt)));
    if (evts.length !== 1) throw new Error(`Beklenen 1 event, gelen ${evts.length}`);
    if (evts[0].points !== 3) throw new Error(`Beklenen 3, gelen ${evts[0].points}`);
  }));

  // ── 9. Okuma puanı tekrar upsert (güncelleme) ────────────────────────────
  results.push(await run('Okuma puanı güncelle (upsert)', async () => {
    await pointEventsRepo.upsertReadingEvent(db, studentId, today, 5, 'Okuma puanı güncellendi');
    const evts = await db.select().from(pointEvents)
      .where(and(eq(pointEvents.studentId, studentId), eq(pointEvents.source, 'reading'), isNull(pointEvents.deletedAt)));
    if (evts[0].points !== 5) throw new Error(`Beklenen 5, gelen ${evts[0].points}`);
  }));

  // ── 10. Okuma puanı 0 → soft-delete ─────────────────────────────────────
  results.push(await run('Okuma puanı 0 → soft-delete', async () => {
    await pointEventsRepo.upsertReadingEvent(db, studentId, today, 0, '');
    const evts = await db.select().from(pointEvents)
      .where(and(eq(pointEvents.studentId, studentId), eq(pointEvents.source, 'reading'), isNull(pointEvents.deletedAt)));
    if (evts.length !== 0) throw new Error(`Soft-delete çalışmadı, ${evts.length} kayıt kaldı`);
  }));

  // ── 11. getTotals ─────────────────────────────────────────────────────────
  results.push(await run('getTotals (sayfalar)', async () => {
    // Önce puanı geri ekle
    await pointEventsRepo.upsertReadingEvent(db, studentId, today, 4, 'Test puan');

    const totals = await pointEventsRepo.getTotals(db, {
      from: today,
      to: today,
      groupId,
    });
    const mine = totals.find((t) => t.studentId === studentId);
    if (!mine) throw new Error('Öğrenci totals\'da yok');
    if (mine.points !== 4) throw new Error(`Beklenen puan 4, gelen ${mine.points}`);
    if (mine.pages !== 30) throw new Error(`Beklenen sayfa 30, gelen ${mine.pages}`);
  }));

  // ── 12. Transaction rollback ──────────────────────────────────────────────
  results.push(await run('Transaction rollback', async () => {
    let threw = false;
    try {
      await withTransaction(db, async (tx) => {
        await tx.insert(books).values({
          id: 'rollback-test-id',
          title: '__ROLLBACK_TEST__',
          totalPages: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        throw new Error('Kasıtlı hata — rollback testi');
      });
    } catch {
      threw = true;
    }
    if (!threw) throw new Error('Transaction hata fırlatmadı');
    // Rollback başarılıysa kayıt DB'de olmamalı
    const rows = await db.select().from(books).where(eq(books.id, 'rollback-test-id'));
    if (rows.length > 0) throw new Error('Rollback başarısız — kayıt kaldı!');
  }));

  // ── 13. Soft-delete (öğrenci) ─────────────────────────────────────────────
  results.push(await run('Soft-delete öğrenci', async () => {
    await studentsRepo.softDeleteStudent(db, studentId);
    const s = await studentsRepo.getStudent(db, studentId);
    if (s !== null) throw new Error('Soft-delete sonrası hâlâ görünüyor');
  }));

  // ── 14. Settings get/set ─────────────────────────────────────────────────
  results.push(await run('Settings get/set', async () => {
    await settingsRepo.setSetting(db, 'pages_per_point', 15);
    const val = await settingsRepo.getSetting(db, 'pages_per_point', 10);
    if (val !== 15) throw new Error(`Beklenen 15, gelen ${val}`);
    // Geri al
    await settingsRepo.setSetting(db, 'pages_per_point', 10);
  }));

  // ── 15. Dönem oluştur + aktif yap ────────────────────────────────────────
  results.push(await run('Dönem oluştur + aktif yap', async () => {
    const t1 = await termsRepo.createTerm(db, {
      name: 'Test Dönem 1',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      isActive: false,
    });
    const t2 = await termsRepo.createTerm(db, {
      name: 'Test Dönem 2',
      startDate: '2025-07-01',
      endDate: '2025-12-31',
      isActive: false,
    });
    await termsRepo.setActiveTerm(db, t1.id);
    const active = await termsRepo.getActiveTerm(db);
    if (active?.id !== t1.id) throw new Error('Aktif dönem yanlış');
    await termsRepo.setActiveTerm(db, t2.id);
    const active2 = await termsRepo.getActiveTerm(db);
    if (active2?.id !== t2.id) throw new Error('Aktif dönem güncellenmedi');
    // Temizle
    await termsRepo.softDeleteTerm(db, t1.id);
    await termsRepo.softDeleteTerm(db, t2.id);
  }));

  // ── TEMİZLİK ─────────────────────────────────────────────────────────────
  // Test verilerini temizle (grupları soft-delete et yeterli)
  try {
    await groupsRepo.softDeleteGroup(db, groupId);
    await booksRepo.softDeleteBook(db, bookId);
  } catch {
    // sessiz
  }

  return results;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export default function DbTestScreen() {
  const { colors, spacing } = useTheme();
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setStarted(true);
    setResults([]);
    try {
      const r = await runAllTests();
      setResults(r);
    } finally {
      setRunning(false);
    }
  };

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text variant="heading" color={colors.primary}>🗄️ DB Testleri</Text>
        <Pressable
          onPress={handleRun}
          disabled={running}
          style={[
            styles.runBtn,
            { backgroundColor: running ? colors.muted : colors.primary, borderRadius: 24 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Testleri çalıştır"
        >
          <Text style={{ color: colors.white, fontFamily: 'Nunito_700Bold', fontSize: 14 }}>
            {running ? 'Çalışıyor…' : 'Testleri Çalıştır'}
          </Text>
        </Pressable>
      </View>

      {started && !running && (
        <View style={[styles.summary, { backgroundColor: failed > 0 ? colors.dangerSoft : colors.successSoft }]}>
          <Text variant="bodySemi" color={failed > 0 ? colors.danger : colors.success}>
            {failed === 0
              ? `✅ ${passed}/${results.length} test geçti`
              : `❌ ${failed} test kaldı, ${passed} geçti`}
          </Text>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.base, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {results.map((r, i) => (
          <View
            key={i}
            style={[
              styles.testRow,
              {
                backgroundColor: r.passed ? colors.successSoft : colors.dangerSoft,
                borderRadius: 10,
                marginBottom: spacing.sm,
                padding: spacing.md,
              },
            ]}
          >
            <Text variant="bodySemi" color={r.passed ? colors.success : colors.danger}>
              {r.passed ? '✅' : '❌'} {r.name}
            </Text>
            {!r.passed && r.error ? (
              <Text variant="caption" color={colors.danger} style={{ marginTop: 4 }}>
                {r.error}
              </Text>
            ) : null}
          </View>
        ))}

        {!started && !running && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text variant="body" color={colors.muted} align="center">
              {"Testleri başlatmak için 'Testleri Çalıştır' düğmesine dokunun."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  runBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    padding: 12,
    alignItems: 'center',
  },
  testRow: {},
});
