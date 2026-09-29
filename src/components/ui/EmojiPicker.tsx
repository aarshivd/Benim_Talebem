/**
 * src/components/ui/EmojiPicker.tsx
 * BottomSheet içinde emoji seçici.
 */

import React from 'react';
import { View, Pressable, FlatList, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { MinTouchTarget } from '@/theme/tokens';
import { BottomSheet } from './BottomSheet';
import { Text } from './Text';
import tr from '@/i18n/tr';

interface EmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  emojis: readonly string[];
  selected?: string;
  title?: string;
}

export function EmojiPicker({
  visible,
  onClose,
  onSelect,
  emojis,
  selected,
  title = 'Emoji Seç',
}: EmojiPickerProps) {
  const { colors, spacing, radius } = useTheme();
  const COLS = 6;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <FlatList
        data={emojis as string[]}
        numColumns={COLS}
        keyExtractor={(item) => item}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isSelected = item === selected;
          return (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(item);
              }}
              style={[
                styles.emojiCell,
                {
                  width: `${100 / COLS}%`,
                  height: MinTouchTarget + 8,
                  borderRadius: radius.md,
                  backgroundColor: isSelected ? colors.primarySoft : colors.transparent,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${tr.a11y.selectEmoji}: ${item}`}
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.emojiWrap}>
                <Text style={{ fontSize: 28 }}>{item}</Text>
              </View>
            </Pressable>
          );
        }}
        contentContainerStyle={{ paddingBottom: spacing.base }}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  emojiCell: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  emojiWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
