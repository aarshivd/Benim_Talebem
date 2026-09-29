/**
 * src/components/ui/ColorPicker.tsx
 * Grup paleti renk seçici — GroupPalette token'larını kullanır.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { GroupPalette, GroupPaletteItem, MinTouchTarget } from '@/theme/tokens';
import { Text } from './Text';
import tr from '@/i18n/tr';

interface ColorPickerProps {
  selected?: number;
  onSelect: (index: number) => void;
  label?: string;
}

export function ColorPicker({ selected, onSelect, label }: ColorPickerProps) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View>
      {label ? (
        <Text variant="captionSemi" color={colors.muted} style={{ marginBottom: spacing.xs }}>
          {label}
        </Text>
      ) : null}

      <View style={styles.grid}>
        {GroupPalette.map((item: GroupPaletteItem, index: number) => {
          const isSelected = selected === index;
          return (
            <Pressable
              key={index}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(index);
              }}
              style={[
                styles.swatch,
                {
                  width: MinTouchTarget,
                  height: MinTouchTarget,
                  borderRadius: radius.md,
                  backgroundColor: item.bg,
                  borderWidth: isSelected ? 2.5 : 1,
                  borderColor: isSelected ? item.text : item.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${tr.a11y.selectColor}: ${item.label}`}
              accessibilityState={{ selected: isSelected }}
            >
              {isSelected ? (
                <Ionicons name="checkmark" size={20} color={item.text} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
