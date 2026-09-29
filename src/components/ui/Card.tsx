/**
 * src/components/ui/Card.tsx
 * Token tabanlı kart yüzeyi — shadow seviyeleri destekli.
 */

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { ShadowKey } from '@/theme/tokens';

interface CardProps {
  children: React.ReactNode;
  shadow?: ShadowKey;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Card({
  children,
  shadow = 'sm',
  padding,
  style,
  accessibilityLabel,
}: CardProps) {
  const { colors, spacing, shadows, variantConfig } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: variantConfig.cardRadius,
          padding: padding ?? spacing.base,
          borderColor: colors.border,
          ...shadows[shadow],
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
