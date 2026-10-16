/**
 * app/settings/terms.tsx
 * Dönemler listesi.
 */

import React from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Screen, Text, FAB, Badge, Button } from '@/components/ui';
import { useTerms, useActiveTerm } from '@/features/terms/hooks';
import { formatDayTr } from '@/domain';
import type { Term } from '@/db/schema';

export default function TermsScreen() {
  const { colors, spacing, radius, shadows } = useTheme();
  const router = useRouter();

  const { data: terms = [], isLoading } = useTerms();
  const { data: activeTerm } = useActiveTerm();

  const renderItem = ({ item }: { item: Term }) => (
    <Pressable
      onPress={() => router.push(`/settings/terms/form?id=${item.id}`)}
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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="bodySemi" color={colors.ink}>
            {item.name}
          </Text>
          {item.isActive && <Badge label="Aktif" variant="primary" />}
        </View>
      </View>
      <Text variant="caption" color={colors.muted}>
        {formatDayTr(item.startDate)} - {formatDayTr(item.endDate)}
      </Text>
    </Pressable>
  );

  return (
    <Screen title="Dönemler" showBack>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={terms}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.base, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Text
                variant="body"
                color={colors.muted}
                style={{ textAlign: 'center', marginBottom: spacing.md }}
              >
                Hiç dönem yok. Yeni bir dönem oluşturarak okumaları takip etmeye başlayın.
              </Text>
              <Button
                label="Dönem Başlat"
                variant="primary"
                onPress={() => router.push('/settings/terms/form')}
              />
            </View>
          }
        />
      )}
      {terms.length > 0 && (
        <FAB
          icon="add"
          accessibilityLabel="Dönem Ekle"
          onPress={() => router.push('/settings/terms/form')}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
