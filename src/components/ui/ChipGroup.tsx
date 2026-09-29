/**
 * src/components/ui/ChipGroup.tsx
 * Tek veya çoklu seçim için chip seti.
 */

import React from 'react';
import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { MinTouchTarget } from '@/theme/tokens';
import { Text } from './Text';

export interface ChipOption {
  value: string;
  label: string;
  emoji?: string;
}

interface ChipGroupProps {
  options: ChipOption[];
  selected: string | string[];
  onSelect: (value: string | string[]) => void;
  multiple?: boolean;
  scrollable?: boolean;
  label?: string;
  testID?: string;
}

export function ChipGroup({
  options,
  selected,
  onSelect,
  multiple = false,
  scrollable = true,
  label,
  testID,
}: ChipGroupProps) {
  const { colors, spacing, radius, fontFamily, fontSize } = useTheme();

  const isSelected = (val: string) => {
    if (multiple) return (selected as string[]).includes(val);
    return selected === val;
  };

  const handlePress = (val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (multiple) {
      const arr = selected as string[];
      if (arr.includes(val)) {
        onSelect(arr.filter((v) => v !== val));
      } else {
        onSelect([...arr, val]);
      }
    } else {
      onSelect(val);
    }
  };

  const chips = options.map((opt) => {
    const active = isSelected(opt.value);
    return (
      <Pressable
        key={opt.value}
        onPress={() => handlePress(opt.value)}
        style={({ pressed }) => [
          styles.chip,
          {
            minHeight: MinTouchTarget,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.full,
            backgroundColor: active ? colors.primary : colors.surface,
            borderColor: active ? colors.primary : colors.border,
            borderWidth: 1.5,
          },
          pressed && { opacity: 0.75 },
        ]}
        accessibilityRole="checkbox"
        accessibilityLabel={opt.label}
        accessibilityState={{ checked: active }}
      >
        {opt.emoji ? (
          <Text style={{ fontSize: fontSize.md, marginRight: spacing.xs }}>{opt.emoji}</Text>
        ) : null}
        <Text
          style={{
            fontFamily: active ? fontFamily.bold : fontFamily.semiBold,
            fontSize: fontSize.sm,
            color: active ? colors.white : colors.ink,
          }}
        >
          {opt.label}
        </Text>
      </Pressable>
    );
  });

  return (
    <View testID={testID}>
      {label ? (
        <Text
          variant="captionSemi"
          color={colors.muted}
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </Text>
      ) : null}

      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {chips}
        </ScrollView>
      ) : (
        <View style={styles.wrap}>{chips}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
