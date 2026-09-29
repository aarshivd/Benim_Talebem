/**
 * src/components/ui/Segmented.tsx
 * Segment kontrolü — tab benzeri seçim.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { MinTouchTarget } from '@/theme/tokens';
import { Text } from './Text';

interface SegmentOption {
  value: string;
  label: string;
}

interface SegmentedProps {
  options: SegmentOption[];
  selected: string;
  onSelect: (value: string) => void;
  testID?: string;
}

export function Segmented({ options, selected, onSelect, testID }: SegmentedProps) {
  const { colors, spacing, radius, fontFamily, fontSize } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.border,
          borderRadius: radius.md,
          padding: 3,
          minHeight: MinTouchTarget,
        },
      ]}
      accessibilityRole="tablist"
      testID={testID}
    >
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(opt.value);
            }}
            style={[
              styles.segment,
              {
                borderRadius: radius.md - 2,
                backgroundColor: active ? colors.surface : colors.transparent,
                paddingHorizontal: spacing.md,
              },
              active && {
                shadowColor: colors.black,
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
            accessibilityRole="tab"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: active }}
          >
            <Text
              style={{
                fontFamily: active ? fontFamily.bold : fontFamily.semiBold,
                fontSize: fontSize.sm,
                color: active ? colors.ink : colors.muted,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
