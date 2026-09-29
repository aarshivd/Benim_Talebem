/**
 * src/components/ui/Badge.tsx
 * Bildirim/sayı rozeti.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import tr from '@/i18n/tr';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  count?: number;
  label?: string;
  variant?: BadgeVariant;
  maxCount?: number;
  dot?: boolean;
}

export function Badge({
  count,
  label,
  variant = 'danger',
  maxCount = 99,
  dot = false,
}: BadgeProps) {
  const { colors, fontFamily, fontSize } = useTheme();

  const bgColors: Record<BadgeVariant, string> = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    neutral: colors.muted,
  };

  const displayCount = count !== undefined && count > maxCount ? `${maxCount}+` : String(count ?? '');
  const displayLabel = label ?? displayCount;

  if (dot) {
    return (
      <View
        style={[styles.dot, { backgroundColor: bgColors[variant] }]}
        accessibilityLabel={count !== undefined ? tr.a11y.badge(count) : undefined}
      />
    );
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bgColors[variant], paddingHorizontal: label ? 8 : 4 },
      ]}
      accessibilityLabel={count !== undefined ? tr.a11y.badge(count) : label}
    >
      <Text
        style={{
          fontFamily: fontFamily.bold,
          fontSize: fontSize.xs,
          color: colors.white,
          lineHeight: fontSize.xs * 1.2,
        }}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
