/**
 * src/components/ui/Screen.tsx
 * SafeArea, arka plan ve isteğe bağlı başlık/geri düğmesiyle standart ekran.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { MinTouchTarget } from '@/theme/tokens';
import { Text } from './Text';
import { IconButton } from './IconButton';
import tr from '@/i18n/tr';

interface ScreenProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Screen({
  title,
  showBack = false,
  onBack,
  rightSlot,
  children,
  scroll = false,
  contentStyle,
  testID,
}: ScreenProps) {
  const { colors, spacing, shadows, fontFamily, fontSize } = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const header =
    title || showBack || rightSlot ? (
      <View
        style={[
          styles.header,
          {
            minHeight: MinTouchTarget,
            paddingHorizontal: spacing.base,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            ...shadows.sm,
          },
        ]}
      >
        {showBack ? (
          <IconButton
            icon="arrow-back"
            onPress={handleBack}
            accessibilityLabel={tr.common.back}
            color={colors.ink}
          />
        ) : (
          <View style={{ width: MinTouchTarget }} />
        )}

        {title ? (
          <Text
            style={{
              flex: 1,
              fontFamily: fontFamily.bold,
              fontSize: fontSize.base,
              color: colors.ink,
              textAlign: 'center',
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <View style={{ width: MinTouchTarget, alignItems: 'flex-end' }}>
          {rightSlot ?? null}
        </View>
      </View>
    ) : null;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={['top', 'left', 'right']}
      testID={testID}
    >
      {header}

      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[{ padding: spacing.base, paddingBottom: spacing.xxxl }, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { padding: spacing.base }, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
  },
});
