/**
 * app/reading/new.tsx
 * Tekli okuma girişi modalı.
 * Query params: ?studentId  &bookId (opsiyonel, önceden seçilmişse)
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme';
import { GroupPalette } from '@/theme/tokens';
import { Screen, Text, Button, NumberStepper, Badge } from '@/components/ui';
import { useGroups } from '@/features/groups/hooks';
import { useStudents } from '@/features/students/hooks';
import { useStudentBooks } from '@/features/books/hooks';
import { useRecordReading } from '@/features/reading/hooks';
import { todayLocal } from '@/domain';
import tr from '@/i18n/tr';

// ─── Tarih seçici (basit, 7 günlük) ─────────────────────────────────────────

function DaySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { colors, spacing, radius } = useTheme();
  const today = todayLocal();

  // 0..6 geri (bugün dahil)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
      {days.map((d) => {
        const active = d === value;
        const label = d === today ? 'Bugün' : d.slice(5).replace('-', '/');
        return (
          <Pressable
            key={d}
            onPress={() => onChange(d)}
            style={[
              styles.dayChip,
              {
                backgroundColor: active ? colors.primary : colors.surface,
                borderRadius: radius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
          >
            <Text variant="captionSemi" color={active ? colors.white : colors.muted}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function NewReadingScreen() {
  const router = useRouter();
  const { studentId: paramStudentId, bookId: paramBookId } = useLocalSearchParams<{
    studentId?: string;
    bookId?: string;
  }>();
  const { colors, spacing, radius } = useTheme();

  const recordReading = useRecordReading();
  const { data: groups = [] } = useGroups();
  
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(paramStudentId ?? '');

  const { data: students = [] } = useStudents(selectedGroupId, { search: '' });
  const { data: studentBooks = [] } = useStudentBooks(selectedStudentId);
  const [selectedStudentBookId, setSelectedStudentBookId] = useState(() => {
    if (paramBookId && studentBooks.length > 0) {
      const found = studentBooks.find((sb) => sb.bookId === paramBookId);
      return found ? found.id : '';
    }
    return '';
  }); // studentBook.id
  
  const [toPage, setToPage] = useState(() => {
    if (paramBookId && studentBooks.length > 0) {
      const found = studentBooks.find((sb) => sb.bookId === paramBookId);
      return found ? found.currentPage : 0;
    }
    return 0;
  });
  const [date, setDate] = useState(todayLocal());
  const [result, setResult] = useState<{ pagesRead: number; points: number; finished: boolean } | null>(null);



  // Seçili studentBook
  const selectedSB = studentBooks.find((sb) => sb.id === selectedStudentBookId);
  const fromPage = selectedSB?.currentPage ?? 0;
  const bookTotalPages = selectedSB?.book?.totalPages ?? 0;
  const pagesReadPreview = Math.max(0, toPage - fromPage);
  const isBookParamFixed = !!paramStudentId && !!paramBookId;



  const handleSave = async () => {
    if (!selectedStudentId || !selectedSB || !selectedSB.book) {
      Alert.alert('Eksik bilgi', 'Lütfen talebe ve kitap seçin.');
      return;
    }

    try {
      const res = await recordReading.mutateAsync({
        studentId: selectedStudentId,
        bookId: selectedSB.bookId,
        bookTotalPages: selectedSB.book.totalPages,
        toPage,
        date,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResult({
        pagesRead: res.pagesRead,
        points: res.pointsAwarded,
        finished: res.finished,
      });
    } catch (e: any) {
      Alert.alert('Hata', e.message ?? tr.snackbar.error);
    }
  };

  // Kutlama sonrası kapat
  if (result) {
    return (
      <View style={[styles.celebrate, { backgroundColor: colors.bg }]}>
        <Text style={{ fontSize: 64, textAlign: 'center' }}>{result.finished ? '🎉' : '⭐'}</Text>
        <Text variant="heading" align="center" style={{ marginTop: spacing.lg }}>
          {result.finished ? 'Kitabı bitirdi! 🎉' : `+${result.pagesRead} sayfa okundu`}
        </Text>
        <Text variant="body" color={colors.muted} align="center" style={{ marginTop: spacing.sm }}>
          {result.points > 0 ? `+${result.points} puan kazandı!` : 'Puan yok (hedef altında)'}
        </Text>
        <View style={{ marginTop: spacing.xxl, gap: spacing.md }}>
          <Button label="Yeni Giriş Yap" onPress={() => { setResult(null); setToPage(fromPage); }} fullWidth />
          <Button label="Kapat" variant="ghost" onPress={() => router.back()} fullWidth />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen title="Okuma Girişi" showBack scroll>
        <View style={{ gap: spacing.lg, paddingBottom: 40 }}>
          {/* Grup seçimi */}
          {!paramStudentId && (
            <View>
              <Text variant="label" style={{ marginBottom: spacing.sm }}>Grup</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                {groups.filter(g => !g.isArchived && g.deletedAt === null).map((g) => {
                  const active = selectedGroupId === g.id;
                  const colorItem = GroupPalette[g.color] ?? GroupPalette[0];
                  return (
                    <Pressable
                      key={g.id}
                      onPress={() => { setSelectedGroupId(g.id); setSelectedStudentId(''); setSelectedStudentBookId(''); }}
                      style={[
                        styles.groupChip,
                        {
                          backgroundColor: active ? colorItem.bg : colors.surface,
                          borderColor: active ? colorItem.border : colors.border,
                          borderRadius: radius.full,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.sm,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Text variant="captionSemi" style={{ color: active ? colorItem.text : colors.muted }}>
                        {g.emoji} {g.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Talebe seçimi */}
          {!paramStudentId && selectedGroupId && (
            <View>
              <Text variant="label" style={{ marginBottom: spacing.sm }}>Talebe</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                {students.map((s) => {
                  const active = selectedStudentId === s.id;
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => { setSelectedStudentId(s.id); setSelectedStudentBookId(''); }}
                      style={[
                        styles.groupChip,
                        {
                          backgroundColor: active ? colors.primarySoft : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                          borderRadius: radius.full,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.sm,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Text variant="captionSemi" color={active ? colors.primary : colors.muted}>
                        {s.firstName} {s.lastName}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Kitap seçimi */}
          {selectedStudentId && !isBookParamFixed && (
            <View>
              <Text variant="label" style={{ marginBottom: spacing.sm }}>Kitap</Text>
              {studentBooks.length === 0 ? (
                <Text variant="caption" color={colors.muted}>Bu talebeye henüz kitap atanmamış.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                  {studentBooks.filter(sb => sb.status !== 'paused').map((sb) => {
                    const active = selectedStudentBookId === sb.id;
                    return (
                      <Pressable
                        key={sb.id}
                        onPress={() => { setSelectedStudentBookId(sb.id); setToPage(sb.currentPage); }}
                        style={[
                          styles.groupChip,
                          {
                            backgroundColor: active ? colors.primarySoft : colors.surface,
                            borderColor: active ? colors.primary : colors.border,
                            borderRadius: radius.lg,
                            padding: spacing.sm,
                            borderWidth: 1,
                            maxWidth: 180,
                          },
                        ]}
                      >
                        <Text variant="captionSemi" color={active ? colors.primary : colors.muted} numberOfLines={2}>
                          {sb.book?.title}
                        </Text>
                        <Text variant="caption" color={colors.muted}>{sb.currentPage}/{sb.book?.totalPages} s.</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}

          {/* Mevcut konum */}
          {selectedSB && (
            <View style={[styles.infoBox, { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.base }]}>
              <Text variant="captionSemi" color={colors.primary}>
                📍 Şu an {fromPage}. sayfada — {selectedSB.book?.title}
              </Text>
            </View>
          )}

          {/* Sayfa girişi */}
          {selectedSB && (
            <View>
              <Text variant="label" style={{ marginBottom: spacing.sm }}>Bugün kaçıncı sayfaya kadar okudu?</Text>
              <NumberStepper
                value={toPage}
                onChange={setToPage}
                min={fromPage}
                max={bookTotalPages}
                step={1}
              />
              {toPage > fromPage && (
                <Text variant="captionSemi" color={colors.success} style={{ marginTop: spacing.xs, textAlign: 'center' }}>
                  Bugün {pagesReadPreview} sayfa okundu
                </Text>
              )}
            </View>
          )}

          {/* Tarih */}
          <View>
            <Text variant="label" style={{ marginBottom: spacing.sm }}>Tarih</Text>
            <DaySelector value={date} onChange={setDate} />
          </View>

          {/* Kaydet */}
          <Button
            label={recordReading.isPending ? tr.common.saving : 'Kaydet'}
            onPress={handleSave}
            disabled={!selectedStudentId || !selectedStudentBookId || toPage <= fromPage || recordReading.isPending}
            fullWidth
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  dayChip: {},
  groupChip: {},
  infoBox: {},
  celebrate: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
});
