/**
 * src/components/ui/Input.tsx
 * Etiket, hata, yardımcı metin ve ikon destekli metin girişi.
 * TextArea için multiline prop kullanılır.
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextInputProps,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { MinTouchTarget } from '@/theme/tokens';
import { Text } from './Text';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: IoniconsName;
  rightIcon?: IoniconsName;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  /** TextArea için true yap */
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  multiline = false,
  numberOfLines = 4,
  ...rest
}: InputProps) {
  const { colors, spacing, radius, fontFamily, fontSize } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;
  const inputHeight = multiline ? numberOfLines * 24 + spacing.lg : MinTouchTarget;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text
          variant="captionSemi"
          color={error ? colors.danger : colors.muted}
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
            minHeight: inputHeight,
            paddingHorizontal: spacing.md,
          },
          focused && {
            borderWidth: 2,
            shadowColor: colors.primary,
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2,
          },
        ]}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={20}
            color={focused ? colors.primary : colors.muted}
            style={{ marginRight: spacing.sm }}
          />
        ) : null}

        <TextInput
          {...rest}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              fontFamily: fontFamily.regular,
              fontSize: fontSize.base,
              color: colors.ink,
              paddingVertical: multiline ? spacing.sm : 0,
            },
          ]}
          placeholderTextColor={colors.placeholder}
          accessibilityLabel={rest.accessibilityLabel ?? label}
          accessibilityHint={helperText}
        />

        {rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ padding: spacing.xs }}
            accessibilityRole="button"
            accessibilityLabel="Sağ ikon"
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={focused ? colors.primary : colors.muted}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text
          variant="caption"
          color={colors.danger}
          style={{ marginTop: spacing.xs }}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          variant="caption"
          color={colors.muted}
          style={{ marginTop: spacing.xs }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

/** TextArea — Input'un çok satırlı varyantı */
export function TextArea(props: Omit<InputProps, 'multiline'>) {
  return <Input {...props} multiline numberOfLines={props.numberOfLines ?? 4} />;
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
  },
});
