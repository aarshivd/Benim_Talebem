/**
 * src/components/ui/SectionHeader.tsx
 * Bölüm başlığı — isteğe bağlı eylem düğmesiyle.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { colors, spacing, fontFamily, fontSize } = useTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.base, marginBottom: spacing.sm }]}>
      <Text variant="captionSemi" color={colors.muted} style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {title}
      </Text>

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={{ fontFamily: fontFamily.semiBold, fontSize: fontSize.sm, color: colors.primary }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
