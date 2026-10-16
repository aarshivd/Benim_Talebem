/**
 * app/reading/group.tsx
 * Grup toplu okuma girişi — tek transaction, hatalı satırlar işaretlenir.
 */

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTheme } from '@/theme';
import { GroupPalette } from '@/theme/tokens';
import { Screen, Text, Button, Avatar, NumberStepper } from '@/components/ui';
import { useGroups, useGroup } from '@/features/groups/hooks';
import { useStudents } from '@/features/students/hooks';
import { useStudentBooks } from '@/features/books/hooks';
import { useRecordReading } from '@/features/reading/hooks';
import { todayLocal } from '@/domain';
import tr from '@/i18n/tr';
import type { Student } from '@/db/schema';

// ─── Per-student row state ────────────────────────────────────────────────────

interface RowState {
  studentId: string;
  studentBookId: string; // studentBooks.id
  bookId: string;
  bookTotal: number;
  fromPage: number;
  toPage: number;
  error?: string;
  saved?: boolean;
}

// ─── Student row component ────────────────────────────────────────────────────

function StudentRow({
  student,
  groupColorIndex,
  rowState,
  onRowChange,
}: {
  student: Student;
  groupColorIndex: number;
  rowState: RowState;
  onRowChange: (state: RowState) => void;
}) {
  const { colors, spacing, radius } = useTheme();
  const { data: studentBooks = [] } = useStudentBooks(student.id);
  const activeBooks = studentBooks.filter((sb) => sb.status === 'reading');

  const colorItem = GroupPalette[groupColorIndex] ?? GroupPalette[0];
  const fullName = `${student.firstName} ${student.lastName}`;

  // Otomatik seç: tek aktif kitap varsa
  React.useEffect(() => {
    if (activeBooks.length === 1 && !rowState.studentBookId) {
      const ab = activeBooks[0];
      onRowChange({
        ...rowState,
        studentBookId: ab.id,
        bookId: ab.bookId,
        bookTotal: ab.book?.totalPages ?? 0,
        fromPage: ab.currentPage,
        toPage: ab.currentPage,
      });
    }
  }, [activeBooks.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const fromPage = rowState.fromPage;
  const hasPagesEntered = rowState.toPage > fromPage;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: rowState.error
            ? colors.dangerSoft
            : rowState.saved
              ? colors.successSoft
              : colors.surface,
          borderRadius: radius.lg,
          padding: spacing.base,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <View style={styles.rowLeft}>
        <Avatar
          name={fullName}
          emoji={student.avatar ?? undefined}
          color={colorItem.bg}
          size="sm"
        />
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Text variant="bodySemi" color={colors.ink} numberOfLines={1}>
            {fullName}
          </Text>

          {/* Birden çok aktif kitap varsa satır içi seçici */}
          {activeBooks.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6, marginTop: 4 }}
            >
              {activeBooks.map((sb) => (
                <Pressable
                  key={sb.id}
                  onPress={() =>
                    onRowChange({
                      ...rowState,
                      studentBookId: sb.id,
                      bookId: sb.bookId,
                      bookTotal: sb.book?.totalPages ?? 0,
                      fromPage: sb.currentPage,
                      toPage: sb.currentPage,
                    })
                  }
                  style={{
                    backgroundColor:
                      rowState.studentBookId === sb.id ? colors.primarySoft : colors.border,
                    borderRadius: radius.md,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    variant="caption"
                    color={rowState.studentBookId === sb.id ? colors.primary : colors.muted}
                    numberOfLines={1}
                  >
                    {sb.book?.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {activeBooks.length === 0 && (
            <Text variant="caption" color={colors.muted}>
              Aktif kitap yok — atlanacak
            </Text>
          )}

          {rowState.studentBookId && (
            <Text variant="caption" color={colors.muted}>
              Şu an: {fromPage}. sayfa
            </Text>
          )}

          {rowState.error && (
            <Text variant="caption" color={colors.danger}>
              {rowState.error}
            </Text>
          )}
          {rowState.saved && (
            <Text variant="caption" color={colors.success}>
              ✓ Kaydedildi
            </Text>
          )}
        </View>
      </View>

      {/* Sayfa stepper */}
      {rowState.studentBookId && !rowState.saved && (
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <NumberStepper
            value={rowState.toPage}
            onChange={(v) => onRowChange({ ...rowState, toPage: v })}
            min={fromPage}
            max={rowState.bookTotal}
            step={1}
          />
          {hasPagesEntered && (
            <Text variant="caption" color={colors.success}>
              +{rowState.toPage - fromPage} s.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function GroupReadingScreen() {
  const router = useRouter();
  const { groupId: paramGroupId } = useLocalSearchParams<{ groupId?: string }>();
  const { colors, spacing } = useTheme();

  const [selectedGroupId, setSelectedGroupId] = useState(paramGroupId ?? '');
  const [date, setDate] = useState(todayLocal());
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [saving, setSaving] = useState(false);

  const { data: groups = [] } = useGroups();
  const { data: group } = useGroup(selectedGroupId);
  const { data: students = [] } = useStudents(selectedGroupId, {});

  const recordReadingMutation = useRecordReading();

  const handleRowChange = (studentId: string, state: RowState) => {
    setRows((prev) => ({ ...prev, [studentId]: state }));
  };

  const getRowState = (student: Student): RowState =>
    rows[student.id] ?? {
      studentId: student.id,
      studentBookId: '',
      bookId: '',
      bookTotal: 0,
      fromPage: 0,
      toPage: 0,
    };

  const handleSaveAll = async () => {
    if (!selectedGroupId) return;
    setSaving(true);
    let savedCount = 0;
    const newRows = { ...rows };

    for (const student of students) {
      const row = getRowState(student);
      // Boş satır veya sayfa girilmemiş — atla
      if (!row.studentBookId || !row.bookId || row.toPage <= row.fromPage) continue;

      try {
        await recordReadingMutation.mutateAsync({
          studentId: student.id,
          bookId: row.bookId,
          bookTotalPages: row.bookTotal,
          toPage: row.toPage,
          date,
        });
        savedCount++;
        newRows[student.id] = { ...row, error: undefined, saved: true };
      } catch (e: any) {
        newRows[student.id] = { ...row, error: e.message ?? 'Hata' };
      }
    }

    setRows(newRows);
    setSaving(false);

    if (savedCount > 0) {
      Alert.alert('Kaydedildi', `${savedCount} talebe için okuma kaydı oluşturuldu.`, [
        { text: tr.common.ok, onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Uyarı', 'Kaydedilecek geçerli satır bulunamadı.');
    }
  };

  const activeGroups = groups.filter((g) => !g.isArchived && g.deletedAt === null);
  const today = todayLocal();

  return (
    <Screen title="Grup Okuma Girişi" showBack>
      {/* Grup seçici */}
      {!paramGroupId && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.md }}
        >
          {activeGroups.map((g) => {
            const active = selectedGroupId === g.id;
            const colorItem = GroupPalette[g.color] ?? GroupPalette[0];
            return (
              <Pressable
                key={g.id}
                onPress={() => {
                  setSelectedGroupId(g.id);
                  setRows({});
                }}
                style={{
                  backgroundColor: active ? colorItem.bg : colors.surface,
                  borderColor: active ? colorItem.border : colors.border,
                  borderWidth: 1,
                  borderRadius: 999,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                }}
              >
                <Text
                  variant="captionSemi"
                  style={{ color: active ? colorItem.text : colors.muted }}
                >
                  {g.emoji} {g.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Tarih seçici */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.md }}
      >
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const label = i === 0 ? 'Bugün' : iso.slice(5).replace('-', '/');
          const active = iso === date;
          return (
            <Pressable
              key={iso}
              onPress={() => setDate(iso)}
              style={{
                backgroundColor: active ? colors.primary : colors.surface,
                borderRadius: 999,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
              }}
            >
              <Text variant="captionSemi" color={active ? colors.white : colors.muted}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {!selectedGroupId ? (
        <Text variant="body" color={colors.muted} align="center" style={{ marginTop: spacing.xl }}>
          Lütfen grup seçin.
        </Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <StudentRow
              student={item}
              groupColorIndex={group?.color ?? 0}
              rowState={getRowState(item)}
              onRowChange={(state) => handleRowChange(item.id, state)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <Text variant="body" color={colors.muted} align="center">
              Bu grupta talebe yok.
            </Text>
          }
        />
      )}

      {/* Save bar */}
      {selectedGroupId && students.length > 0 && (
        <View
          style={[
            styles.saveBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              padding: spacing.base,
            },
          ]}
        >
          <Button
            label={saving ? tr.common.saving : 'Hepsini Kaydet'}
            onPress={handleSaveAll}
            disabled={saving}
            fullWidth
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  saveBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
