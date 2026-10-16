/**
 * app/settings/security.tsx
 * Güvenlik ve Hoca Ayarları
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useTheme } from '@/theme';
import { Screen, Text, Button, Input, Segmented, PinPad } from '@/components/ui';
import { useSettings, useUpdateSettings } from '@/features/settings/hooks';
import { useSession } from '@/store/session';
import { verifyPin, setPin as updatePin } from '@/lib/pin';

const schema = z.object({
  teacher_name: z.string().min(2, 'En az 2 karakter olmalı'),
  auto_lock_seconds: z.string(),
});

type FormValues = z.infer<typeof schema>;

export default function SecurityScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();

  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { init } = useSession();

  const [pinStep, setPinStep] = useState<'none' | 'old' | 'new' | 'confirm'>('none');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [newPinTemp, setNewPinTemp] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      teacher_name: '',
      auto_lock_seconds: '60',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        teacher_name: (settings as any).teacher_name ?? '',
        auto_lock_seconds: String(settings.auto_lock_seconds ?? 60),
      });
    }
  }, [settings, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateSettings.mutateAsync({
        teacher_name: values.teacher_name,
        auto_lock_seconds: Number(values.auto_lock_seconds),
      } as any);

      // Update session store with new name
      await init();
      Alert.alert('Başarılı', 'Ayarlar kaydedildi.');
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  const handlePinPress = (key: string) => {
    if (pinInput.length < 6) {
      setPinInput((prev) => prev + key);
      setPinError('');
    }
  };

  const handlePinDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setPinError('');
  };

  const handlePinConfirm = async () => {
    if (pinInput.length < 4) {
      setPinError('PIN en az 4 haneli olmalı.');
      return;
    }

    try {
      if (pinStep === 'old') {
        const isValid = await verifyPin(pinInput);
        if (isValid) {
          setPinInput('');
          setPinStep('new');
        } else {
          setPinError('Eski PIN yanlış.');
          setPinInput('');
        }
      } else if (pinStep === 'new') {
        setNewPinTemp(pinInput);
        setPinInput('');
        setPinStep('confirm');
      } else if (pinStep === 'confirm') {
        if (pinInput === newPinTemp) {
          await updatePin(pinInput);
          Alert.alert('Başarılı', 'PIN kodunuz başarıyla değiştirildi.');
          setPinStep('none');
          setPinInput('');
        } else {
          setPinError('Girdiğiniz PIN eşleşmiyor. Lütfen tekrar deneyin.');
          setPinInput('');
          setPinStep('new');
        }
      }
    } catch (e: any) {
      setPinError(e.message);
      setPinInput('');
    }
  };

  if (isLoading) {
    return (
      <Screen title="Güvenlik" showBack>
        <Text>Yükleniyor...</Text>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen title="Güvenlik" showBack scroll>
        <ScrollView contentContainerStyle={{ gap: spacing.lg, paddingBottom: 40 }}>
          <Controller
            control={control}
            name="teacher_name"
            render={({ field }) => (
              <Input
                label="Hoca Adı"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.teacher_name?.message}
                placeholder="Ör. Erdem Hoca"
              />
            )}
          />

          <Controller
            control={control}
            name="auto_lock_seconds"
            render={({ field }) => (
              <View>
                <Text variant="label" color={colors.muted} style={{ marginBottom: spacing.xs }}>
                  Otomatik Kilit Süresi
                </Text>
                <Segmented
                  options={[
                    { label: 'Hemen', value: '1' },
                    { label: '1 dk', value: '60' },
                    { label: '5 dk', value: '300' },
                    { label: 'Asla', value: '0' },
                  ]}
                  selected={field.value}
                  onSelect={field.onChange}
                />
              </View>
            )}
          />

          <Button
            label={isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            fullWidth
          />

          <View
            style={{
              marginTop: spacing.xl,
              paddingTop: spacing.xl,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Text variant="heading" color={colors.ink} style={{ marginBottom: spacing.md }}>
              PIN Yönetimi
            </Text>
            <Button
              label="PIN Değiştir"
              variant="secondary"
              onPress={() => {
                setPinStep('old');
                setPinInput('');
                setPinError('');
              }}
            />
          </View>
        </ScrollView>

        <Modal visible={pinStep !== 'none'} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.8)',
              justifyContent: 'center',
              padding: spacing.xl,
            }}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                padding: spacing.xl,
                borderRadius: radius.xl,
                alignItems: 'center',
              }}
            >
              <Text variant="heading" color={colors.ink} style={{ marginBottom: spacing.md }}>
                {pinStep === 'old'
                  ? 'Eski PIN Kodunuz'
                  : pinStep === 'new'
                    ? 'Yeni PIN Belirleyin'
                    : 'Yeni PIN Tekrar'}
              </Text>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: spacing.xl }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.pinDot,
                      { backgroundColor: i < pinInput.length ? colors.primary : colors.border },
                    ]}
                  />
                ))}
              </View>

              {!!pinError && (
                <Text variant="caption" color={colors.danger} style={{ marginBottom: spacing.md }}>
                  {pinError}
                </Text>
              )}

              <PinPad onKeyPress={handlePinPress} onDelete={handlePinDelete} />

              <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
                <Button
                  label="İptal"
                  variant="secondary"
                  onPress={() => setPinStep('none')}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Onayla"
                  variant="primary"
                  onPress={handlePinConfirm}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
