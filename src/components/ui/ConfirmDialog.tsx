/**
 * src/components/ui/ConfirmDialog.tsx
 * Onay diyaloğu — tehlikeli işlemler için kırmızı onay düğmesi.
 */

import React from 'react';
import { View, Modal, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';
import tr from '@/i18n/tr';

interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  dangerous?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  dangerous = false,
}: ConfirmDialogProps) {
  const { colors, spacing, radius, shadows, fontFamily, fontSize } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessible
      accessibilityViewIsModal
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.overlayBg }]}
        onPress={onCancel}
        accessibilityLabel="Kapat"
      >
        <Pressable
          style={[
            styles.dialog,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              padding: spacing.xl,
              ...shadows.xl,
            },
          ]}
          onPress={() => {}} // diyaloğun içine tıklanınca kapanmasın
        >
          {title ? (
            <Text
              style={{
                fontFamily: fontFamily.bold,
                fontSize: fontSize.base,
                color: colors.ink,
                marginBottom: spacing.sm,
                textAlign: 'center',
              }}
            >
              {title}
            </Text>
          ) : null}

          {message ? (
            <Text
              variant="body"
              color={colors.muted}
              align="center"
              style={{ marginBottom: spacing.xl }}
            >
              {message}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Button
              label={cancelLabel ?? tr.common.cancel}
              variant="ghost"
              onPress={onCancel}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <Button
              label={confirmLabel ?? tr.common.confirm}
              variant={dangerous ? 'danger' : 'primary'}
              onPress={onConfirm}
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
