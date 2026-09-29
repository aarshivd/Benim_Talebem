/**
 * src/components/ui/EmptyState.tsx
 * Boş veri durumu — emoji + başlık + açıklama + eylem düğmesi.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  emoji = '📭',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { spacing, colors } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xxl }]}>
      <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: spacing.base }}>{emoji}</Text>

      <Text variant="title" color={colors.ink} align="center">
        {title}
      </Text>

      {description ? (
        <Text
          variant="body"
          color={colors.muted}
          align="center"
          style={{ marginTop: spacing.sm }}
        >
          {description}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <View style={{ marginTop: spacing.xl }}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
