/**
 * src/components/ui/Skeleton.tsx
 * Yükleme iskelet animasyonu — Reanimated ile parlama efekti.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 16, borderRadius, style }: SkeletonProps) {
  const { colors, radius } = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.5, { duration: 700 })),
      -1,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.skel,
        {
          width,
          height,
          borderRadius: borderRadius ?? radius.sm,
          backgroundColor: colors.border,
        },
        animStyle,
        style,
      ]}
      accessibilityLabel="Yükleniyor"
      accessibilityRole="none"
    />
  );
}

/** Kart iskeleti — avatar + satırlar */
export function SkeletonCard() {
  const { spacing } = useTheme();
  return (
    <View style={[styles.card, { padding: spacing.base, gap: spacing.sm }]}>
      <View style={styles.row}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={{ flex: 1, gap: spacing.xs, marginLeft: spacing.md }}>
          <Skeleton height={14} width="60%" />
          <Skeleton height={11} width="40%" />
        </View>
      </View>
      <Skeleton height={11} />
      <Skeleton height={11} width="80%" />
    </View>
  );
}

const styles = StyleSheet.create({
  skel: {},
  card: {
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
