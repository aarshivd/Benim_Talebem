/**
 * src/components/ui/Avatar.tsx
 * Emoji veya baş harf avatarı — varyant ayarına göre otomatik seçilir.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  emoji?: string;
  color?: string;
  size?: AvatarSize;
  /** Varyant config'i override eder */
  forceStyle?: 'emoji' | 'initials';
  accessibilityLabel?: string;
}

export function Avatar({
  name,
  emoji,
  color,
  size = 'md',
  forceStyle,
  accessibilityLabel,
}: AvatarProps) {
  const { colors, variantConfig, fontFamily } = useTheme();

  const avatarStyle = forceStyle ?? variantConfig.avatarStyle;

  const sizeMap: Record<AvatarSize, number> = {
    sm: 36,
    md: 48,
    lg: 60,
    xl: 80,
  };

  const fontSizeMap: Record<AvatarSize, number> = {
    sm: 16,
    md: 22,
    lg: 28,
    xl: 38,
  };

  const dim = sizeMap[size];
  const fs = fontSizeMap[size];

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const bgColor = color ?? colors.primarySoft;
  const textColor = color ? colors.white : colors.primary;

  return (
    <View
      style={[
        styles.container,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: bgColor,
        },
      ]}
      accessibilityLabel={accessibilityLabel ?? `${name} avatarı`}
      accessibilityRole="image"
    >
      {avatarStyle === 'emoji' && emoji ? (
        <Text style={{ fontSize: fs }}>{emoji}</Text>
      ) : (
        <Text
          style={{
            fontFamily: fontFamily.extraBold,
            fontSize: fs * 0.5,
            color: textColor,
          }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
