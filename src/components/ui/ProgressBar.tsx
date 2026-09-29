/**
 * src/components/ui/ProgressBar.tsx
 * Reanimated ile animasyonlu ilerleme çubuğu.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Text } from './Text';
import tr from '@/i18n/tr';

interface ProgressBarProps {
  /** 0 ile 1 arası */
  progress: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  color,
  height = 10,
  showLabel = false,
  label,
  animated = true,
}: ProgressBarProps) {
  const { colors, radius, spacing } = useTheme();
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const widthPct = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      widthPct.value = withTiming(clampedProgress * 100, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      widthPct.value = clampedProgress * 100;
    }
  }, [animated, clampedProgress, widthPct]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${widthPct.value}%`,
  }));

  const pct = Math.round(clampedProgress * 100);

  return (
    <View accessibilityRole="progressbar" accessibilityLabel={tr.a11y.progress(pct)}>
      {(showLabel || label) ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          {label ? <Text variant="captionSemi" color={colors.muted}>{label}</Text> : <View />}
          {showLabel ? <Text variant="captionSemi" color={colors.primary}>%{pct}</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.track,
          {
            height,
            borderRadius: radius.full,
            backgroundColor: colors.border,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              borderRadius: radius.full,
              backgroundColor: color ?? colors.primary,
            },
            animStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
