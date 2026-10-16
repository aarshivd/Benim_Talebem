/**
 * app/group/[id].tsx
 * Grup detay ekranı: talebe listesi, arama, çoklu seçim, FAB.
 */

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { GroupPalette } from '@/theme/tokens';
import { Text, Button, IconButton, Input, FAB, EmptyState, Avatar, Badge } from '@/components/ui';
import { useGroup, useGroupsWithCounts } from '@/features/groups/hooks';
import { useStudents, useMoveStudents, useSetStudentActive } from '@/features/students/hooks';
import tr from '@/i18n/tr';
import type { Student } from '@/db/schema';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius, shadows } = useTheme();

  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isMultiSelect = selectedIds.size > 0;

  const { data: group } = useGroup(id);
  const { data: students = [], refetch } = useStudents(id, {
    search: search.trim() || undefined,
    includeInactive: showInactive,
  });

  const moveStudents = useMoveStudents();
  const setActive = useSetStudentActive();
  const { data: allGroups = [] } = useGroupsWithCounts();

  const colorItem = GroupPalette[group?.color ?? 0] ?? GroupPalette[0];

  // ─── Multi-select logic ────────────────────────────────────────────────────

  const toggleSelect = (studentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleMoveToGroup = () => {
    const otherGroups = allGroups.filter(
      (g) => g.id !== id && !g.isArchived && g.deletedAt === null,
    );
    if (otherGroups.length === 0) {
      Alert.alert('Başka grup yok', 'Taşımak için başka bir aktif grup bulunmuyor.');
      return;
    }

    Alert.alert('Başka Gruba Taşı', 'Hangi gruba taşınsın?', [
      ...otherGroups.map((g) => ({
        text: `${g.emoji} ${g.name}`,
        onPress: async () => {
          await moveStudents.mutateAsync({
            studentIds: Array.from(selectedIds),
            groupId: g.id,
          });
          clearSelection();
          refetch();
        },
      })),
      { text: tr.common.cancel, style: 'cancel' as const },
    ]);
  };

  const handleSetInactive = () => {
    Alert.alert('Pasife Al', `${selectedIds.size} talebe pasif yapılacak. Devam?`, [
      { text: tr.common.cancel, style: 'cancel' },
      {
        text: 'Pasife Al',
        style: 'destructive',
        onPress: async () => {
          await Promise.all(
            Array.from(selectedIds).map((sid) =>
              setActive.mutateAsync({ id: sid, isActive: false }),
            ),
          );
          clearSelection();
          refetch();
        },
      },
    ]);
  };

  // ─── Render student item ──────────────────────────────────────────────────

  const renderItem = ({ item }: { item: Student }) => {
    const isSelected = selectedIds.has(item.id);
    const fullName = `${item.firstName} ${item.lastName}`;

    return (
      <Pressable
        onPress={() => {
          if (isMultiSelect) {
            toggleSelect(item.id);
          } else {
            router.push(`/student/${item.id}`);
          }
        }}
        onLongPress={() => toggleSelect(item.id)}
        style={[
          styles.studentRow,
          {
            backgroundColor: isSelected ? colors.primarySoft : colors.surface,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.base,
            paddingVertical: spacing.md,
            marginBottom: spacing.sm,
            ...shadows.sm,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={fullName}
      >
        <View style={styles.studentLeft}>
          {isMultiSelect && (
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderRadius: radius.sm,
                  marginRight: spacing.md,
                },
              ]}
            >
              {isSelected && (
                <Text variant="captionSemi" color={colors.white}>
                  ✓
                </Text>
              )}
            </View>
          )}
          <Avatar name={fullName} emoji={item.avatar ?? undefined} color={colorItem.bg} size="md" />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text variant="bodySemi" color={item.isActive ? colors.ink : colors.muted}>
              {fullName}
            </Text>
            {item.grade ? (
              <Text variant="caption" color={colors.muted}>
                {item.grade}. sınıf
              </Text>
            ) : null}
            {!item.isActive && <Badge label="Pasif" variant="neutral" />}
          </View>
        </View>
        {/* 📖 Okuma ve ⭐ Puan kısayolları */}
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          {!isMultiSelect && (
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <Pressable
                onPress={() => router.push(`/points/give?studentIds=${item.id}&groupId=${id}`)}
                hitSlop={8}
                accessibilityLabel="Puan ver"
              >
                <Text style={{ fontSize: 20 }}>⭐</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push(`/reading/new?studentId=${item.id}`)}
                hitSlop={8}
                accessibilityLabel="Okuma girişi"
              >
                <Text style={{ fontSize: 20 }}>📖</Text>
              </Pressable>
            </View>
          )}
          <Text variant="caption" color={colors.muted}>
            —
          </Text>
        </View>
      </Pressable>
    );
  };

  const ITEM_HEIGHT = 84; // 44 avatar + 32 padding + 8 margin

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Renkli başlık */}
      <View
        style={[
          styles.headerBg,
          { backgroundColor: colorItem.bg, paddingTop: 48, paddingBottom: spacing.lg },
        ]}
      >
        <View style={styles.headerRow}>
          <IconButton
            icon="arrow-back"
            onPress={() => router.back()}
            color={colorItem.text}
            accessibilityLabel={tr.common.back}
          />
          <View style={{ flex: 1, marginHorizontal: spacing.md }}>
            <Text variant="heading" style={{ color: colorItem.text }} numberOfLines={1}>
              {group?.emoji} {group?.name}
            </Text>
            <Text variant="caption" style={{ color: colorItem.text }}>
              {students.length} talebe
            </Text>
          </View>
          <IconButton
            icon="create-outline"
            onPress={() => router.push(`/group/form?id=${id}`)}
            color={colorItem.text}
            accessibilityLabel={tr.common.edit}
          />
        </View>

        {/* Arama */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md }}>
          <Input
            placeholder={tr.common.search}
            value={search}
            onChangeText={setSearch}
            leftIcon="search"
          />
        </View>

        {/* Pasif göster toggle */}
        <Pressable
          onPress={() => setShowInactive((v) => !v)}
          style={{
            paddingHorizontal: spacing.base,
            paddingTop: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: showInactive }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              borderWidth: 1.5,
              borderColor: colorItem.text,
              backgroundColor: showInactive ? colorItem.text : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showInactive && (
              <Text variant="caption" color={colorItem.bg}>
                ✓
              </Text>
            )}
          </View>
          <Text variant="caption" style={{ color: colorItem.text }}>
            Pasifleri göster
          </Text>
        </Pressable>

        {/* Grup okuma girişi butonu */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md }}>
          <Button
            label="📖 Grup Okuma Girişi"
            variant="secondary"
            size="sm"
            onPress={() => router.push(`/reading/group?groupId=${id}`)}
          />
        </View>
      </View>

      {/* Liste */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        contentContainerStyle={{
          padding: spacing.base,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <EmptyState
            emoji="👤"
            title={tr.empty.activeStudents}
            actionLabel="Talebe Ekle"
            onAction={() => router.push(`/student/form?groupId=${id}`)}
          />
        }
      />

      {/* FAB — çoklu seçimde gizle */}
      {!isMultiSelect && (
        <FAB
          icon="person-add-outline"
          onPress={() => router.push(`/student/form?groupId=${id}`)}
          accessibilityLabel="Talebe ekle"
        />
      )}

      {/* Çoklu seçim alt işlem çubuğu */}
      {isMultiSelect && (
        <View
          style={[
            styles.actionBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: spacing.lg,
              paddingHorizontal: spacing.base,
            },
          ]}
        >
          <Text variant="bodySemi" color={colors.ink}>
            {selectedIds.size} seçildi
          </Text>
          <View style={styles.actionButtons}>
            <Button
              label="Puan Ver"
              variant="secondary"
              size="sm"
              onPress={() => {
                router.push(
                  `/points/give?studentIds=${Array.from(selectedIds).join(',')}&groupId=${id}`,
                );
                clearSelection();
              }}
            />
            <Button label="Gruba Taşı" variant="secondary" size="sm" onPress={handleMoveToGroup} />
            <Button label="Pasife Al" variant="danger" size="sm" onPress={handleSetInactive} />
            <Button label={tr.common.cancel} variant="ghost" size="sm" onPress={clearSelection} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBg: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
});
