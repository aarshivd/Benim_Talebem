/**
 * src/components/ui/ListItem.tsx
 * Sol ikon/avatar, başlık, alt başlık, sağ aksesuar destekli liste satırı.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { MinTouchTarget } from '@/theme/tokens';
import { Text } from './Text';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  rightIcon?: IoniconsName;
  onPress?: () => void;
  showChevron?: boolean;
  showDivider?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function ListItem({
  title,
  subtitle,
  leftSlot,
  rightSlot,
  rightIcon,
  onPress,
  showChevron = true,
  showDivider = true,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ListItemProps) {
  const { colors, spacing } = useTheme();

  const handlePress = () => {
    if (disabled) return;
    Haptics.selectionAsync();
    onPress?.();
  };

  const inner = (
    <View
      style={[
        styles.row,
        { minHeight: MinTouchTarget, paddingVertical: spacing.sm, paddingHorizontal: spacing.base },
      ]}
    >
      {leftSlot ? <View style={{ marginRight: spacing.md }}>{leftSlot}</View> : null}

      <View style={styles.content}>
        <Text variant="bodySemi" color={disabled ? colors.muted : colors.ink} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color={colors.muted} numberOfLines={1} style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightSlot ? <View style={{ marginLeft: spacing.sm }}>{rightSlot}</View> : null}

      {rightIcon ? (
        <Ionicons
          name={rightIcon}
          size={20}
          color={colors.muted}
          style={{ marginLeft: spacing.sm }}
        />
      ) : showChevron && onPress ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.muted}
          style={{ marginLeft: spacing.sm }}
        />
      ) : null}
    </View>
  );

  return (
    <View>
      {onPress ? (
        <Pressable
          onPress={handlePress}
          disabled={disabled}
          style={({ pressed }) => [pressed && { backgroundColor: colors.border + '40' }]}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? title}
          accessibilityHint={accessibilityHint ?? subtitle}
          accessibilityState={{ disabled }}
          testID={testID}
        >
          {inner}
        </Pressable>
      ) : (
        <View testID={testID}>{inner}</View>
      )}

      {showDivider ? (
        <View
          style={[styles.divider, { backgroundColor: colors.border, marginLeft: spacing.base }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
