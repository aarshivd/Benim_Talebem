/**
 * app/settings/rewards.tsx
 * Ödüller listesi.
 */

import React from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Screen, Text, FAB, Badge } from '@/components/ui';
import { useRewards } from '@/features/rewards/hooks';
import type { Reward } from '@/db/schema';

export default function RewardsScreen() {
  const { colors, spacing, radius, shadows } = useTheme();
  const router = useRouter();

  const { data: rewards = [], isLoading } = useRewards();

  const renderItem = ({ item }: { item: Reward }) => (
    <Pressable
      onPress={() => router.push(`/settings/rewards/form?id=${item.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.md,
          marginBottom: spacing.sm,
          opacity: pressed ? 0.7 : 1,
          ...shadows.sm,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 32, marginRight: spacing.md }}>{item.icon}</Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Text variant="bodySemi" color={colors.ink}>
              {item.name}
            </Text>
            {!item.isActive && <Badge label="Pasif" variant="neutral" />}
          </View>
          <Text variant="caption" color={colors.muted} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
            <Badge label={item.scope === 'daily' ? 'Günlük' : 'Dönemlik'} variant="primary" />
            <Badge
              label={
                item.kind === 'points'
                  ? `Hedef: ${item.targetPoints}p`
                  : `Sıra: İlk ${item.rankTop}`
              }
              variant="warning"
            />
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <Screen title="Ödüller" showBack>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={rewards}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.base, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Text variant="body" color={colors.muted}>
                Henüz ödül kuralı yok.
              </Text>
            </View>
          }
        />
      )}
      <FAB
        icon="add"
        accessibilityLabel="Ekle"
        onPress={() => router.push('/settings/rewards/form')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
