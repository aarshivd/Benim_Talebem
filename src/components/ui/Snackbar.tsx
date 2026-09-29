/**
 * src/components/ui/Snackbar.tsx
 * Ekran altında kayan bildirim — Geri Al gibi eylem butonu destekli.
 */

import React, { useEffect, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface SnackbarProps {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  duration?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function Snackbar({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = 3500,
  variant = 'default',
}: SnackbarProps) {
  const { colors, spacing, radius, shadows, fontFamily, fontSize } = useTheme();
  const translateY = useSharedValue(100);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(100, { duration: 250 }, (finished) => {
      if (finished && onDismiss) runOnJS(onDismiss)();
    });
  }, [onDismiss, translateY]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 280 });
      const timer = setTimeout(() => dismiss(), duration);
      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(100, { duration: 250 });
    }
    return undefined;
  }, [visible, duration, dismiss, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const bgColors: Record<NonNullable<SnackbarProps['variant']>, string> = {
    default: colors.ink,
    success: colors.success,
    warning: colors.warning,
    error: colors.danger,
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgColors[variant],
          borderRadius: radius.md,
          padding: spacing.md,
          paddingLeft: spacing.base,
          marginHorizontal: spacing.base,
          marginBottom: spacing.base,
          ...shadows.lg,
        },
        animStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text
        style={{
          flex: 1,
          fontFamily: fontFamily.semiBold,
          fontSize: fontSize.sm,
          color: colors.white,
        }}
        numberOfLines={2}
      >
        {message}
      </Text>

      {actionLabel && onAction ? (
        <Pressable
          onPress={() => {
            onAction();
            dismiss();
          }}
          style={{ marginLeft: spacing.base, paddingHorizontal: spacing.sm, paddingVertical: 4 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text
            style={{
              fontFamily: fontFamily.extraBold,
              fontSize: fontSize.sm,
              color: colors.white,
              textDecorationLine: 'underline',
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
