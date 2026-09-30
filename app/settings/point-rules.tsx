/**
 * app/settings/point-rules.tsx
 * Puan kuralları listesi, sıralama, silme.
 */

import React from 'react';
import { View, StyleSheet, FlatList, Pressable, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Screen, Text, Button, IconButton, FAB, EmptyState, Badge } from '@/components/ui';
import { usePointRules, useUpdatePointRule, useDeletePointRule, useReorderPointRules } from '@/features/points/hooks';
import tr from '@/i18n/tr';
import type { PointRule } from '@/db/schema';

const CATEGORY_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  soru: 'primary',
  davranis: 'success',
  gorev: 'warning',
  ozel: 'neutral',
};

export default function PointRulesScreen() {
  const router = useRouter();
  const { colors, spacing, radius, shadows } = useTheme();

  const { data: rules = [] } = usePointRules();
  const updateRule = useUpdatePointRule();
  const deleteRule = useDeletePointRule();
  const reorderRules = useReorderPointRules();

  const handleToggleActive = (rule: PointRule) => {
    updateRule.mutate({ id: rule.id, data: { isActive: !rule.isActive } });
  };

  const handleDelete = (rule: PointRule) => {
    Alert.alert(
      tr.deleteDialog.title,
      `${rule.name} silinecek. Eski geçmiş kayıtları etkilenmez.`,
      [
        { text: tr.deleteDialog.cancel, style: 'cancel' },
        { text: tr.deleteDialog.confirm, style: 'destructive', onPress: () => deleteRule.mutate(rule.id) },
      ]
    );
  };

  const moveRule = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= rules.length) return;
    const newRules = [...rules];
    const temp = newRules[index];
    newRules[index] = newRules[index + direction];
    newRules[index + direction] = temp;
    
    reorderRules.mutate(newRules.map((r) => r.id));
  };

  const renderRule = ({ item, index }: { item: PointRule; index: number }) => {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.base, marginBottom: spacing.md, ...shadows.sm }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 32, marginRight: spacing.md }}>{item.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text variant="bodySemi" color={colors.ink}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 }}>
              <Badge label={item.category.toUpperCase()} variant={CATEGORY_COLORS[item.category] || 'neutral'} />
              <Text variant="captionSemi" color={item.points > 0 ? colors.success : colors.danger}>
                {item.points > 0 ? `+${item.points}` : item.points} puan
              </Text>
            </View>
          </View>
          
          <View style={{ alignItems: 'flex-end', marginLeft: spacing.sm }}>
            <Switch
              value={item.isActive}
              onValueChange={() => handleToggleActive(item)}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }}>
          <View style={{ flexDirection: 'row' }}>
            <IconButton icon="arrow-up" onPress={() => moveRule(index, -1)} disabled={index === 0} color={index === 0 ? colors.border : colors.ink} accessibilityLabel="Yukarı taşı" />
            <IconButton icon="arrow-down" onPress={() => moveRule(index, 1)} disabled={index === rules.length - 1} color={index === rules.length - 1 ? colors.border : colors.ink} accessibilityLabel="Aşağı taşı" />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button label="Düzenle" variant="secondary" size="sm" onPress={() => router.push(`/settings/point-rules/form?id=${item.id}`)} />
            <Button label="Sil" variant="danger" size="sm" onPress={() => handleDelete(item)} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen title="Puan Kuralları" showBack>
      <FlatList
        data={rules}
        keyExtractor={(r) => r.id}
        renderItem={renderRule}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState emoji="⭐" title="Henüz puan kuralı yok." actionLabel="Kural Ekle" onAction={() => router.push('/settings/point-rules/form')} />}
      />
      <FAB icon="add" onPress={() => router.push('/settings/point-rules/form')} accessibilityLabel="Kural Ekle" />
    </Screen>
  );
}

const styles = StyleSheet.create({ card: {} });
