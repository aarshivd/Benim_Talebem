/**
 * src/components/ui/BottomSheet.tsx
 * Modal alt sayfa — Reanimated ile kayma animasyonu.
 * Ek native paket yok; expo-router/GestureHandler ile çalışır.
 */

import React, { useEffect } from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '@/theme';
import { Colors } from '@/theme/tokens';
import { Text } from './Text';
import { IconButton } from './IconButton';
import tr from '@/i18n/tr';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Maksimum içerik yüksekliği (ekranın oranı olarak) */
  maxHeightRatio?: number;
  showCloseButton?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  maxHeightRatio = 0.85,
  showCloseButton = true,
}: BottomSheetProps) {
  const { colors, spacing, radius, shadows, fontFamily, fontSize } = useTheme();

  const translateY = useSharedValue(600);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 250 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(600, { duration: 200 }, (finished) => {
        if (finished) runOnJS(onClose)();
      });
    }
  }, [visible, onClose, overlayOpacity, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 120) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
      accessible
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {/* Karartma */}
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={onClose}
            accessibilityLabel="Kapat"
          />
        </Animated.View>

        {/* Sayfa */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                maxHeight: `${Math.round(maxHeightRatio * 100)}%`,
                ...shadows.xl,
              },
              sheetStyle,
            ]}
          >
            {/* Tutma kolu */}
            <View style={styles.handle}>
              <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
            </View>

            {/* Başlık */}
            {title || showCloseButton ? (
              <View
                style={[
                  styles.header,
                  {
                    paddingHorizontal: spacing.base,
                    paddingBottom: spacing.sm,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  {title ? (
                    <Text
                      style={{
                        fontFamily: fontFamily.bold,
                        fontSize: fontSize.base,
                        color: colors.ink,
                      }}
                    >
                      {title}
                    </Text>
                  ) : null}
                </View>
                {showCloseButton ? (
                  <IconButton
                    icon="close"
                    onPress={onClose}
                    accessibilityLabel={tr.a11y.closeModal}
                    color={colors.muted}
                  />
                ) : null}
              </View>
            ) : null}

            <ScrollView
              style={styles.flex}
              contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing.xxl }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlayBg,
  },
  sheet: {
    width: '100%',
  },
  handle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
