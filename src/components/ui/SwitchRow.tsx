/**
 * src/components/ui/SwitchRow.tsx
 * Açıklama + Switch satır bileşeni.
 */

import React from 'react';
import { View, Switch, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { MinTouchTarget } from '@/theme/tokens';
import { Text } from './Text';
import tr from '@/i18n/tr';

interface SwitchRowProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  description?: string;
  disabled?: boolean;
  testID?: string;
}

export function SwitchRow({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
  testID,
}: SwitchRowProps) {
  const { colors, spacing } = useTheme();

  const handleToggle = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(!value);
  };

  return (
    <Pressable
      onPress={handleToggle}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        { minHeight: MinTouchTarget, opacity: disabled ? 0.5 : 1 },
        pressed && { opacity: 0.8 },
      ]}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{
        checked: value,
        disabled,
      }}
      testID={testID}
    >
      <View style={{ flex: 1, marginRight: spacing.md }}>
        <Text variant="bodySemi" color={colors.ink}>
          {label}
        </Text>
        {description ? (
          <Text variant="caption" color={colors.muted} style={{ marginTop: 2 }}>
            {description}
          </Text>
        ) : null}
      </View>

      <Switch
        value={value}
        onValueChange={(v) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onValueChange(v);
        }}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.border}
        accessibilityLabel={value ? tr.a11y.switchOn : tr.a11y.switchOff}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
