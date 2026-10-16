/**
 * app/student/[id].tsx
 * Talebe profil ekranı: başlık kartı + okuma bölümü (kitaplar, geçmiş, streak, mini grafik).
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { GroupPalette } from '@/theme/tokens';
import {
  Screen,
  Text,
  Button,
  IconButton,
  Avatar,
  Segmented,
  EmptyState,
  Badge,
  ProgressBar,
} from '@/components/ui';
import { useStudent, useDeleteStudent, useSetStudentActive } from '@/features/students/hooks';
import { useGroup } from '@/features/groups/hooks';
import { useStudentBooks } from '@/features/books/hooks';
import { useReadingLogs, useDeleteLog, useAllStudentLogs } from '@/features/reading/hooks';
import { usePointEvents, useDeletePointEvent } from '@/features/points/hooks';
import { useRanking } from '@/features/ranking/hooks';
import { useActiveTerm } from '@/features/terms/hooks';
import { calcStreak, todayLocal } from '@/domain';
import tr from '@/i18n/tr';
import type { StudentBook, ReadingLog, PointEvent } from '@/db/schema';

// ─── Types ───────────────────────────────────────────────────────────────────

const TABS = [
  { label: 'Okuma', value: 'reading' },
  { label: 'Puanlar', value: 'points' },
] as const;

type Tab = (typeof TABS)[number]['value'];

const STATUS_LABELS = {
  reading: '📖 Okuyor',
  finished: '✅ Bitti',
  paused: '⏸ Duraklattı',
} as const;

// ─── Mini bar chart (son 7 gün) ──────────────────────────────────────────────

function MiniBarChart({ studentId, logs }: { studentId: string; logs: ReadingLog[] }) {
  const { colors, spacing, radius } = useTheme();
  const today = todayLocal();

  // Son 7 gün
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const pagesPerDay = days.map((day) =>
    logs.filter((l) => l.date === day && !l.deletedAt).reduce((acc, l) => acc + l.pagesRead, 0),
  );

  const maxPages = Math.max(...pagesPerDay, 1);

  return (
    <View style={[styles.barChart, { gap: spacing.xs }]}>
      {days.map((day, i) => {
        const pct = pagesPerDay[i] / maxPages;
        const label = day === today ? 'Bugün' : day.slice(8);
        return (
          <View key={day} style={{ alignItems: 'center', flex: 1 }}>
            <View
              style={[styles.barTrack, { borderRadius: radius.sm, backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${Math.round(pct * 100)}%`,
                    backgroundColor: pct > 0 ? colors.primary : colors.border,
                    borderRadius: radius.sm,
                  },
                ]}
              />
            </View>
            <Text variant="caption" color={colors.muted} style={{ fontSize: 9, marginTop: 2 }}>
              {label}
            </Text>
            {pagesPerDay[i] > 0 && (
              <Text variant="caption" color={colors.primary} style={{ fontSize: 9 }}>
                {pagesPerDay[i]}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Reading tab content ──────────────────────────────────────────────────────

function ReadingTab({ studentId }: { studentId: string }) {
  const { colors, spacing, radius, shadows } = useTheme();
  const router = useRouter();
  const { data: studentBooks = [] } = useStudentBooks(studentId);
  const { data: allLogs = [] } = useAllStudentLogs(studentId);
  const deleteLog = useDeleteLog();

  // Tüm kitapların logları için birleşik liste
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const today = todayLocal();

  // Streak hesabı — tüm log tarihlerinden
  const logDays = [...new Set(allLogs.filter((l) => !l.deletedAt).map((l) => l.date))];
  const streak = calcStreak(logDays);

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: 100 }}>
      {/* Streak + mini grafik */}
      <View
        style={[
          styles.statsCard,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            padding: spacing.base,
            ...shadows.sm,
          },
        ]}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: spacing.md,
          }}
        >
          <View>
            <Text variant="captionSemi" color={colors.muted}>
              Okuma Serisi
            </Text>
            <Text variant="heading" color={colors.primary}>
              {streak} gün 🔥
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="captionSemi" color={colors.muted}>
              Son 7 Gün
            </Text>
            <Text variant="caption" color={colors.muted}>
              {allLogs
                .filter(
                  (l) =>
                    !l.deletedAt &&
                    l.date >=
                      (() => {
                        const d = new Date();
                        d.setDate(d.getDate() - 6);
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      })(),
                )
                .reduce((a, l) => a + l.pagesRead, 0)}{' '}
              sayfa
            </Text>
          </View>
        </View>
        <MiniBarChart studentId={studentId} logs={allLogs} />
      </View>

      {/* Kitap ekle kısayolu */}
      <Button
        label="📖 Okuma Girişi Yap"
        variant="secondary"
        onPress={() => router.push(`/reading/new?studentId=${studentId}`)}
        fullWidth
      />
      <Button
        label="📚 Kitap Ata"
        variant="ghost"
        onPress={() => router.push(`/book/assign?studentId=${studentId}`)}
        fullWidth
      />

      {/* Kitap kartları */}
      {studentBooks.length === 0 ? (
        <EmptyState
          emoji="📚"
          title="Henüz kitap atanmamış."
          actionLabel="Kitap Ata"
          onAction={() => router.push(`/book/assign?studentId=${studentId}`)}
        />
      ) : (
        studentBooks.map((sb) => {
          if (!sb.book) return null;
          const pct = sb.book.totalPages > 0 ? sb.currentPage / sb.book.totalPages : 0;
          const isExpanded = expandedBookId === sb.bookId;

          return (
            <View
              key={sb.id}
              style={[
                styles.bookCard,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.xl,
                  padding: spacing.base,
                  ...shadows.sm,
                },
              ]}
            >
              <Pressable onPress={() => setExpandedBookId(isExpanded ? null : sb.bookId)}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: spacing.sm,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="bodySemi" color={colors.ink}>
                      {sb.book.title}
                    </Text>
                    {sb.book.author ? (
                      <Text variant="caption" color={colors.muted}>
                        {sb.book.author}
                      </Text>
                    ) : null}
                    <Text variant="caption" color={colors.muted}>
                      {STATUS_LABELS[sb.status]} · {sb.currentPage}/{sb.book.totalPages} sayfa
                    </Text>
                  </View>
                  <Text variant="caption" color={colors.muted}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </View>
                <ProgressBar
                  progress={pct}
                  height={6}
                  color={sb.status === 'finished' ? colors.success : colors.primary}
                />
              </Pressable>

              {/* Okuma geçmişi */}
              {isExpanded && <BookLogsSection studentId={studentId} bookId={sb.bookId} sb={sb} />}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

// ─── Per-book log list ────────────────────────────────────────────────────────

function BookLogsSection({
  studentId,
  bookId,
  sb,
}: {
  studentId: string;
  bookId: string;
  sb: StudentBook & { book: any };
}) {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const { data: logs = [] } = useReadingLogs(studentId, bookId);
  const deleteLog = useDeleteLog();
  const today = todayLocal();

  const activeLogs = logs.filter((l) => !l.deletedAt);

  // Son kayıt ID'si
  const lastLogId = activeLogs.length > 0 ? activeLogs[0].id : null;

  const handleDelete = (log: ReadingLog) => {
    Alert.alert(
      'Kaydı Sil',
      `${log.date} tarihli ${log.pagesRead} sayfalık kaydı silmek istiyor musunuz?`,
      [
        { text: tr.common.cancel, style: 'cancel' },
        {
          text: tr.deleteDialog.confirm,
          style: 'destructive',
          onPress: () => deleteLog.mutate(log.id),
        },
      ],
    );
  };

  return (
    <View
      style={{
        marginTop: spacing.md,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        paddingTop: spacing.md,
      }}
    >
      <Text variant="captionSemi" color={colors.muted} style={{ marginBottom: spacing.sm }}>
        Okuma Geçmişi
      </Text>
      {activeLogs.length === 0 ? (
        <Text variant="caption" color={colors.muted}>
          Henüz okuma kaydı yok.
        </Text>
      ) : (
        activeLogs.map((log) => {
          const isLast = log.id === lastLogId;
          return (
            <View
              key={log.id}
              style={[
                styles.logRow,
                {
                  borderBottomColor: colors.border,
                  paddingVertical: spacing.sm,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text variant="captionSemi" color={colors.ink}>
                  {log.date}
                </Text>
                <Text variant="caption" color={colors.muted}>
                  {log.fromPage} → {log.toPage} ({log.pagesRead} sayfa)
                </Text>
                {!isLast && (
                  <Text variant="caption" color={colors.muted}>
                    🔒 Yalnızca son kayıt düzenlenebilir
                  </Text>
                )}
              </View>
              {isLast && (
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <IconButton
                    icon="pencil"
                    onPress={() =>
                      router.push(
                        `/reading/edit?logId=${log.id}&bookTotalPages=${sb.book?.totalPages ?? 0}`,
                      )
                    }
                    color={colors.primary}
                    accessibilityLabel={tr.common.edit}
                  />
                  <IconButton
                    icon="trash-outline"
                    onPress={() => handleDelete(log)}
                    color={colors.danger}
                    accessibilityLabel={tr.common.delete}
                  />
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

// ─── Points tab content ───────────────────────────────────────────────────────

function PointsTab({ studentId }: { studentId: string }) {
  const { colors, spacing, radius, shadows } = useTheme();
  const router = useRouter();
  const { data: events = [] } = usePointEvents(studentId);
  const deleteEvent = useDeletePointEvent();
  const today = todayLocal();

  const activeEvents = events.filter((e) => !e.deletedAt);
  const totalPoints = activeEvents.reduce((acc, e) => acc + e.points, 0);
  const todayPoints = activeEvents
    .filter((e) => e.date === today)
    .reduce((acc, e) => acc + e.points, 0);

  // Group by date
  const grouped: Record<string, typeof activeEvents> = {};
  for (const e of activeEvents) {
    if (!grouped[e.date]) grouped[e.date] = [];
    grouped[e.date].push(e);
  }
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleDelete = (event: any) => {
    Alert.alert(
      'İşlemi Geri Al',
      `${event.title} (${event.points} puan) işlemini geri almak istiyor musunuz?`,
      [
        { text: tr.common.cancel, style: 'cancel' },
        {
          text: 'Geri Al',
          style: 'destructive',
          onPress: () => deleteEvent.mutate(event.id),
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: 100 }}>
      {/* İstatistikler */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View
          style={[
            {
              flex: 1,
              backgroundColor: colors.surface,
              padding: spacing.md,
              borderRadius: radius.lg,
              ...shadows.sm,
            },
          ]}
        >
          <Text variant="captionSemi" color={colors.muted}>
            Bugün
          </Text>
          <Text variant="heading" color={colors.primary}>
            {todayPoints}
          </Text>
        </View>
        <View
          style={[
            {
              flex: 1,
              backgroundColor: colors.surface,
              padding: spacing.md,
              borderRadius: radius.lg,
              ...shadows.sm,
            },
          ]}
        >
          <Text variant="captionSemi" color={colors.muted}>
            Toplam
          </Text>
          <Text variant="heading" color={colors.primary}>
            {totalPoints}
          </Text>
        </View>
      </View>

      <Button
        label="⭐ Puan Ver"
        onPress={() => router.push(`/points/give?studentIds=${studentId}`)}
        fullWidth
      />

      {dates.length === 0 ? (
        <EmptyState emoji="⭐" title="Henüz puanı yok." />
      ) : (
        dates.map((d) => (
          <View key={d} style={{ marginTop: spacing.sm }}>
            <Text variant="captionSemi" color={colors.muted} style={{ marginBottom: spacing.sm }}>
              {d === today ? 'Bugün' : d}
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                ...shadows.sm,
                overflow: 'hidden',
              }}
            >
              {grouped[d].map((event, i) => {
                const isLast = i === grouped[d].length - 1;
                return (
                  <View
                    key={event.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: spacing.md,
                      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 24, marginRight: spacing.md }}>
                      {event.source === 'reading' ? '📖' : event.source === 'manual' ? '⭐' : '✍️'}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodySemi" color={colors.ink}>
                        {event.title}
                      </Text>
                      {event.note && (
                        <Text variant="caption" color={colors.muted}>
                          {event.note}
                        </Text>
                      )}
                      {event.source === 'reading' && (
                        <Text variant="caption" color={colors.muted}>
                          Okuma kaydından hesaplanır
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end', marginLeft: spacing.sm }}>
                      <Text
                        variant="bodySemi"
                        color={event.points > 0 ? colors.success : colors.danger}
                      >
                        {event.points > 0 ? `+${event.points}` : event.points}
                      </Text>
                      {event.source !== 'reading' && (
                        <Pressable
                          onPress={() => handleDelete(event)}
                          hitSlop={8}
                          style={{ marginTop: 4 }}
                        >
                          <Text variant="caption" color={colors.danger}>
                            Geri al
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function StudentProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>('reading');

  const { data: student } = useStudent(id);
  const { data: group } = useGroup(student?.groupId ?? '');
  const deleteStudent = useDeleteStudent();
  const setActive = useSetStudentActive();

  const { data: activeTerm } = useActiveTerm();
  const { data: rankingData } = useRanking({
    scope: 'term',
    termId: activeTerm?.id,
  });

  const studentRewards = rankingData?.earnedRewards[id] ?? [];
  const allRewards = rankingData?.allRewards ?? [];

  const colorItem = GroupPalette[group?.color ?? 0] ?? GroupPalette[0];
  const fullName = student ? `${student.firstName} ${student.lastName}` : '';

  const handleDelete = () => {
    Alert.alert(
      tr.deleteDialog.title,
      'Talebeyi silmek istediğinize emin misiniz? Okuma ve puan geçmişi de gizlenecek.',
      [
        { text: tr.deleteDialog.cancel, style: 'cancel' },
        {
          text: tr.deleteDialog.confirm,
          style: 'destructive',
          onPress: async () => {
            await deleteStudent.mutateAsync(id);
            router.back();
          },
        },
      ],
    );
  };

  const handleToggleActive = () => {
    if (!student) return;
    const newState = !student.isActive;
    Alert.alert(
      newState ? 'Aktife Al' : 'Pasife Al',
      `${fullName} ${newState ? 'aktif' : 'pasif'} yapılsın mı?`,
      [
        { text: tr.common.cancel, style: 'cancel' },
        {
          text: tr.common.confirm,
          onPress: () => setActive.mutateAsync({ id, isActive: newState }),
        },
      ],
    );
  };

  if (!student) {
    return (
      <Screen title="Talebe" showBack>
        <EmptyState emoji="👤" title="Talebe bulunamadı." />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Renkli başlık kartı */}
      <View style={[{ backgroundColor: colorItem.bg, paddingTop: 48, paddingBottom: 24 }]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 8,
            marginBottom: 8,
          }}
        >
          <IconButton
            icon="arrow-back"
            onPress={() => router.back()}
            color={colorItem.text}
            accessibilityLabel={tr.common.back}
          />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <IconButton
              icon="book-outline"
              onPress={() => router.push(`/reading/new?studentId=${id}`)}
              color={colorItem.text}
              accessibilityLabel="Okuma girişi"
            />
            <IconButton
              icon="create-outline"
              onPress={() => router.push(`/student/form?id=${id}`)}
              color={colorItem.text}
              accessibilityLabel={tr.common.edit}
            />
          </View>
        </View>

        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
          <Avatar
            name={fullName}
            emoji={student.avatar ?? undefined}
            color={colorItem.bg}
            size="xl"
          />
          <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text variant="heading" style={{ color: colorItem.text }}>
                {fullName}
              </Text>
              {!student.isActive && <Badge label="Pasif" variant="neutral" />}
            </View>
            {group && (
              <Text variant="caption" style={{ color: colorItem.text, marginTop: 4 }}>
                {group.emoji} {group.name}
                {student.grade ? ` · ${student.grade}. sınıf` : ''}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* İşlem butonları */}
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          paddingHorizontal: spacing.base,
          paddingVertical: spacing.md,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        }}
      >
        <Button
          label="⭐ Puan Ver"
          variant="primary"
          size="sm"
          onPress={() => router.push(`/points/give?studentIds=${id}`)}
          style={{ flex: 1 }}
        />
        <Button
          label={student.isActive ? 'Pasife Al' : 'Aktife Al'}
          variant="secondary"
          size="sm"
          onPress={handleToggleActive}
        />
        <Button label={tr.common.delete} variant="danger" size="sm" onPress={handleDelete} />
      </View>

      {/* Tabs */}
      <View style={{ paddingHorizontal: spacing.base, paddingVertical: spacing.md }}>
        <Segmented
          options={TABS.map((t) => ({ label: t.label, value: t.value }))}
          selected={activeTab}
          onSelect={(v) => setActiveTab(v as Tab)}
        />
      </View>

      {/* Kazandığı Ödüller */}
      {studentRewards.length > 0 && (
        <View style={{ paddingHorizontal: spacing.base, marginBottom: spacing.sm }}>
          <Text variant="captionSemi" color={colors.muted} style={{ marginBottom: spacing.xs }}>
            Bu Dönem Kazandığı Ödüller
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            {studentRewards.map((rid) => {
              const r = allRewards.find((x) => x.id === rid);
              return (
                <View
                  key={rid}
                  style={{
                    backgroundColor: colors.sunSoft,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: radius.full,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, marginRight: 6 }}>{r?.icon ?? '🏆'}</Text>
                  <Text variant="captionSemi" color={colors.ink}>
                    {r?.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Tab içerikleri */}
      <View style={{ flex: 1, paddingHorizontal: spacing.base }}>
        {activeTab === 'reading' ? <ReadingTab studentId={id} /> : <PointsTab studentId={id} />}
      </View>

      {/* Not */}
      {!!student.note && (
        <View
          style={{
            margin: spacing.base,
            padding: spacing.base,
            backgroundColor: colors.sunSoft,
            borderRadius: radius.lg,
          }}
        >
          <Text variant="captionSemi" color={colors.ink}>
            📝 Not
          </Text>
          <Text variant="body" color={colors.ink} style={{ marginTop: spacing.xs }}>
            {student.note}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statsCard: {},
  bookCard: {},
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  barChart: { flexDirection: 'row', height: 60, alignItems: 'flex-end' },
  barTrack: { width: '100%', height: 50, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%' },
});
