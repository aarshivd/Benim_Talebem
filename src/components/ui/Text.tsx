/**
 * src/components/ui/Text.tsx
 * Token tabanlı tipografi bileşeni.
 */

import React from 'react';
import {
  Text as RNText,
  TextStyle,
  StyleProp,
  StyleSheet,
  AccessibilityRole,
} from 'react-native';
import { useTheme } from '@/theme';

type TextVariant =
  | 'display'
  | 'heading'
  | 'title'
  | 'body'
  | 'bodySemi'
  | 'caption'
  | 'captionSemi'
  | 'label';

interface TextProps {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  color,
  align,
  numberOfLines,
  style,
  accessibilityLabel,
  accessibilityRole,
  children,
}: TextProps) {
  const { colors, textStyles } = useTheme();

  const variantStyle: TextStyle = (() => {
    switch (variant) {
      case 'display':
        return textStyles.displayBold;
      case 'heading':
        return textStyles.headingBold;
      case 'title':
        return textStyles.titleSemiBold;
      case 'body':
        return textStyles.bodyRegular;
      case 'bodySemi':
        return textStyles.bodySemiBold;
      case 'caption':
        return textStyles.captionRegular;
      case 'captionSemi':
        return textStyles.captionSemiBold;
      case 'label':
        return textStyles.labelRegular;
    }
  })();

  return (
    <RNText
      style={[variantStyle, { color: color ?? colors.ink, textAlign: align }, style]}
      numberOfLines={numberOfLines}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </RNText>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _styles = StyleSheet.create({});
