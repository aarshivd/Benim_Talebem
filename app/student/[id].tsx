/**
 * app/student/[id].tsx
 * Talebe profil iskelet ekranı.
 * Okuma ve puan bölümleri yer tutucu; sonraki aşamalarda doldurulacak.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
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
} from '@/components/ui';
import { useStudent, useDeleteStudent, useSetStudentActive } from '@/features/students/hooks';
import { useGroup } from '@/features/groups/hooks';
import tr from '@/i18n/tr';

const TABS = [
  { label: 'Okuma', value: 'reading' },
  { label: 'Puanlar', value: 'points' },
] as const;

type Tab = (typeof TABS)[number]['value'];

export default function StudentProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>('reading');

  const { data: student } = useStudent(id);
  const { data: group } = useGroup(student?.groupId ?? '');
  const deleteStudent = useDeleteStudent();
  const setActive = useSetStudentActive();

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
      <View style={[styles.headerCard, { backgroundColor: colorItem.bg, paddingTop: 48 }]}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-back"
            onPress={() => router.back()}
            color={colorItem.text}
            accessibilityLabel={tr.common.back}
          />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <IconButton
              icon="create-outline"
              onPress={() => router.push(`/student/form?id=${id}`)}
              color={colorItem.text}
              accessibilityLabel={tr.common.edit}
            />
          </View>
        </View>

        <View style={styles.avatarSection}>
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
              {!student.isActive && (
                <Badge label="Pasif" variant="neutral" />
              )}
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
        style={[
          styles.actionRow,
          {
            paddingHorizontal: spacing.base,
            paddingVertical: spacing.md,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
            gap: spacing.sm,
          },
        ]}
      >
        <Button
          label={student.isActive ? 'Pasife Al' : 'Aktife Al'}
          variant="secondary"
          size="sm"
          onPress={handleToggleActive}
        />
        <Button
          label={tr.common.delete}
          variant="danger"
          size="sm"
          onPress={handleDelete}
        />
      </View>

      {/* Segmented tabs */}
      <View style={{ paddingHorizontal: spacing.base, paddingVertical: spacing.md }}>
        <Segmented
          options={TABS.map((t) => ({ label: t.label, value: t.value }))}
          selected={activeTab}
          onSelect={(v) => setActiveTab(v as Tab)}
        />
      </View>

      {/* Tab içerikleri */}
      <ScrollView contentContainerStyle={{ padding: spacing.base, flexGrow: 1 }}>
        {activeTab === 'reading' && (
          <EmptyState
            emoji="📖"
            title="Okuma kayıtları yakında"
            description="Kitap ve okuma takibi bir sonraki aşamada eklenecek."
          />
        )}
        {activeTab === 'points' && (
          <EmptyState
            emoji="⭐"
            title="Puan geçmişi yakında"
            description="Manuel puan girişi ve sıralama bir sonraki aşamada eklenecek."
          />
        )}
      </ScrollView>

      {/* Not */}
      {!!student.note && (
        <View
          style={[
            styles.noteBox,
            {
              margin: spacing.base,
              padding: spacing.base,
              backgroundColor: colors.sunSoft,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Text variant="captionSemi" color={colors.ink}>📝 Not</Text>
          <Text variant="body" color={colors.ink} style={{ marginTop: spacing.xs }}>
            {student.note}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  avatarSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  actionRow: {
    flexDirection: 'row',
  },
  noteBox: {},
});
