/**
 * src/components/ui/NumberStepper.tsx
 * Büyük +/− düğmeleri ve klavye girişi destekli sayı bileşeni.
 */

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { MinTouchTarget } from '@/theme/tokens';
import { Text } from './Text';
import tr from '@/i18n/tr';

interface NumberStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  testID?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  label,
  disabled = false,
  testID,
}: NumberStepperProps) {
  const { colors, spacing, radius, fontFamily, fontSize } = useTheme();
  const [inputVal, setInputVal] = useState(String(value));

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const handleDecrement = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = clamp(value - step);
    onChange(next);
    setInputVal(String(next));
  };

  const handleIncrement = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = clamp(value + step);
    onChange(next);
    setInputVal(String(next));
  };

  const handleChangeText = (text: string) => {
    setInputVal(text);
    const parsed = parseInt(text, 10);
    if (!isNaN(parsed)) {
      onChange(clamp(parsed));
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputVal, 10);
    const clamped = isNaN(parsed) ? value : clamp(parsed);
    setInputVal(String(clamped));
    onChange(clamped);
  };

  const btnStyle = {
    width: MinTouchTarget + 8,
    height: MinTouchTarget + 8,
    borderRadius: radius.md,
    backgroundColor: disabled ? colors.border : colors.primarySoft,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  return (
    <View style={styles.wrapper} testID={testID}>
      {label ? (
        <Text variant="captionSemi" color={colors.muted} style={{ marginBottom: spacing.xs }}>
          {label}
        </Text>
      ) : null}

      <View style={styles.row}>
        <Pressable
          onPress={handleDecrement}
          disabled={disabled || value <= min}
          style={({ pressed }) => [btnStyle, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={tr.a11y.decreaseValue}
          accessibilityState={{ disabled: disabled || value <= min }}
        >
          <Ionicons
            name="remove"
            size={28}
            color={disabled || value <= min ? colors.muted : colors.primary}
          />
        </Pressable>

        <TextInput
          value={inputVal}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          keyboardType="number-pad"
          style={[
            styles.input,
            {
              fontFamily: fontFamily.extraBold,
              fontSize: fontSize.xl,
              color: colors.ink,
              borderColor: colors.border,
              borderRadius: radius.md,
              backgroundColor: colors.surface,
              minWidth: 80,
            },
          ]}
          editable={!disabled}
          maxLength={5}
          accessibilityLabel={label ?? 'Sayı'}
          textAlign="center"
          selectTextOnFocus
        />

        <Pressable
          onPress={handleIncrement}
          disabled={disabled || value >= max}
          style={({ pressed }) => [btnStyle, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={tr.a11y.increaseValue}
          accessibilityState={{ disabled: disabled || value >= max }}
        >
          <Ionicons
            name="add"
            size={28}
            color={disabled || value >= max ? colors.muted : colors.primary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'center',
  },
});
