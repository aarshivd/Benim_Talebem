/**
 * src/components/ui/Button.tsx
 * primary / secondary / ghost / danger; sm/md/lg; loading; hafif haptic.
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { MinTouchTarget } from '@/theme/tokens';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const { colors, spacing, variantConfig, fontFamily, fontSize } = useTheme();

  const isDisabled = disabled || loading;

  const heights: Record<ButtonSize, number> = {
    sm: MinTouchTarget,
    md: 52,
    lg: 60,
  };

  const paddingH: Record<ButtonSize, number> = {
    sm: spacing.md,
    md: spacing.xl,
    lg: spacing.xxl,
  };

  const fontSizes: Record<ButtonSize, number> = {
    sm: fontSize.sm,
    md: fontSize.base,
    lg: fontSize.lg,
  };

  const bgColors: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.primarySoft,
    ghost: colors.transparent,
    danger: colors.dangerSoft,
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: colors.white,
    secondary: colors.primary,
    ghost: colors.primary,
    danger: colors.danger,
  };

  const borderColors: Record<ButtonVariant, string> = {
    primary: colors.transparent,
    secondary: colors.transparent,
    ghost: colors.primary,
    danger: colors.transparent,
  };

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const containerStyle: ViewStyle = {
    height: heights[size],
    paddingHorizontal: paddingH[size],
    borderRadius: variantConfig.buttonRadius,
    backgroundColor: bgColors[variant],
    borderWidth: variant === 'ghost' ? 1.5 : 0,
    borderColor: borderColors[variant],
    opacity: isDisabled ? 0.5 : 1,
    alignSelf: fullWidth ? 'stretch' : 'auto',
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        containerStyle,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColors[variant]}
          accessibilityLabel="Yükleniyor"
        />
      ) : (
        <Text
          style={{
            fontFamily: fontFamily.bold,
            fontSize: fontSizes[size],
            color: textColors[variant],
            lineHeight: fontSizes[size] * 1.2,
          }}
          accessibilityRole="text"
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
});
