/**
 * src/components/ui/FAB.tsx
 * Floating Action Button — Reanimated ile giriş animasyonlu.
 */

import React, { useEffect } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { MinTouchTarget } from '@/theme/tokens';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface FABProps {
  icon: IoniconsName;
  onPress: () => void;
  color?: string;
  size?: number;
  accessibilityLabel: string;
  testID?: string;
}

export function FAB({
  icon,
  onPress,
  color,
  size = 56,
  accessibilityLabel,
  testID,
}: FABProps) {
  const { colors, shadows } = useTheme();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 200 }));
  }, [scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const btnSize = Math.max(size, MinTouchTarget);

  return (
    <Animated.View
      style={[
        styles.container,
        animStyle,
        {
          width: btnSize,
          height: btnSize,
          borderRadius: btnSize / 2,
          backgroundColor: color ?? colors.primary,
          ...shadows.lg,
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.pressable,
          { width: btnSize, height: btnSize, borderRadius: btnSize / 2 },
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        <Ionicons name={icon} size={size * 0.45} color={colors.white} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
