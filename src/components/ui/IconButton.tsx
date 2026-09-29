/**
 * src/components/ui/IconButton.tsx
 * Ionicons tabanlı ikon düğmesi — minimum 48dp dokunma alanı.
 */

import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { MinTouchTarget } from '@/theme/tokens';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface IconButtonProps {
  icon: IoniconsName;
  onPress?: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  accessibilityHint?: string;
  testID?: string;
}

export function IconButton({
  icon,
  onPress,
  size = 24,
  color,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: IconButtonProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        { opacity: disabled ? 0.4 : 1 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      testID={testID}
    >
      <Ionicons name={icon} size={size} color={color ?? colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: MinTouchTarget,
    height: MinTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
