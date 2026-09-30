/**
 * app/reading/edit.tsx
 * Son okuma kaydını düzenleme modalı.
 * ?logId &bookTotalPages params zorunlu.
 */

import React, { useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Screen, Text, Button, NumberStepper } from '@/components/ui';
import { useEditLog } from '@/features/reading/hooks';
import tr from '@/i18n/tr';

export default function EditReadingScreen() {
  const router = useRouter();
  const { logId, bookTotalPages, currentToPage } = useLocalSearchParams<{
    logId: string;
    bookTotalPages: string;
    currentToPage?: string;
  }>();
  const { colors, spacing } = useTheme();
  const editLog = useEditLog();

  const total = parseInt(bookTotalPages, 10) || 9999;
  const [toPage, setToPage] = useState(parseInt(currentToPage ?? '0', 10));

  const handleSave = async () => {
    try {
      await editLog.mutateAsync({ logId, newToPage: toPage, bookTotalPages: total });
      router.back();
    } catch (e: any) {
      Alert.alert('Hata', e.message ?? tr.snackbar.error);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen title="Kaydı Düzenle" showBack>
        <View style={{ gap: spacing.lg, paddingBottom: 40 }}>
          <Text variant="label">Hedef Sayfa</Text>
          <NumberStepper value={toPage} onChange={setToPage} min={0} max={total} step={1} />
          <Button
            label={editLog.isPending ? tr.common.saving : tr.common.save}
            onPress={handleSave}
            disabled={editLog.isPending}
            fullWidth
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
