/**
 * app/(tabs)/groups.tsx
 * Gruplar sekmesi: kart listesi, Aktif|Arşiv segmenti, FAB.
 */

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/theme';
import { GroupPalette } from '@/theme/tokens';
import { Screen, Text, FAB, EmptyState, Segmented, Badge } from '@/components/ui';
import { useGroupsWithCounts } from '@/features/groups/hooks';
import tr from '@/i18n/tr';

const SEGMENTS = [
  { label: 'Aktif', value: 'active' },
  { label: 'Arşiv', value: 'archived' },
];

const LEVEL_LABELS: Record<string, string> = {
  ilkokul: 'İlkokul',
  ortaokul: 'Ortaokul',
  lise: 'Lise',
  universite: 'Üniversite',
};

export default function GroupsScreen() {
  const router = useRouter();
  const { colors, spacing, radius, shadows } = useTheme();
  const [segment, setSegment] = useState<'active' | 'archived'>('active');

  const { data: allGroups = [], isLoading, refetch } = useGroupsWithCounts();

  const filtered = allGroups.filter((g) => (segment === 'active' ? !g.isArchived : g.isArchived));

  const renderGroup = ({ item }: { item: (typeof filtered)[number] }) => {
    const colorItem = GroupPalette[item.color] ?? GroupPalette[0];

    return (
      <Pressable
        onPress={() => router.push(`/group/${item.id}`)}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            marginBottom: spacing.md,
            ...shadows.md,
            overflow: 'hidden',
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={item.name}
      >
        {/* Sol renk şeridi */}
        <View
          style={[
            styles.colorStripe,
            { backgroundColor: colorItem.bg, borderRightColor: colorItem.border },
          ]}
        >
          <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
        </View>

        {/* İçerik */}
        <View
          style={[
            styles.cardContent,
            { paddingVertical: spacing.md, paddingHorizontal: spacing.base },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text variant="bodySemi" color={colors.ink} numberOfLines={1} style={{ flex: 1 }}>
              {item.name}
            </Text>
            {item.isArchived && <Badge label="Arşiv" variant="neutral" />}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              marginTop: spacing.xs,
            }}
          >
            <View
              style={{
                backgroundColor: colorItem.bg,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: radius.full,
              }}
            >
              <Text variant="caption" style={{ color: colorItem.text }}>
                {LEVEL_LABELS[item.level] ?? item.level}
              </Text>
            </View>
            <Text variant="caption" color={colors.muted}>
              {item.studentCount} talebe
            </Text>
          </View>
        </View>

        {/* Ok */}
        <View style={{ justifyContent: 'center', paddingRight: spacing.base }}>
          <Text variant="body" color={colors.muted}>
            ›
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <Screen title="Gruplar">
      <View style={[styles.segmentContainer, { marginBottom: spacing.md }]}>
        <Segmented
          options={SEGMENTS}
          selected={segment}
          onSelect={(v) => setSegment(v as 'active' | 'archived')}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState
            emoji="📚"
            title={segment === 'active' ? tr.empty.groups : tr.empty.groupsArchived}
            actionLabel={segment === 'active' ? 'Grup Oluştur' : undefined}
            onAction={segment === 'active' ? () => router.push('/group/form') : undefined}
          />
        }
      />

      {segment === 'active' && (
        <FAB icon="add" onPress={() => router.push('/group/form')} accessibilityLabel="Grup ekle" />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  segmentContainer: {
    paddingBottom: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  colorStripe: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
  },
  cardContent: {
    flex: 1,
  },
});
