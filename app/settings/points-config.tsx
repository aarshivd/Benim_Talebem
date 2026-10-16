/**
 * app/settings/points-config.tsx
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useTheme } from '@/theme';
import { Screen, Text, Button, Input, SwitchRow } from '@/components/ui';
import { useSettings, useUpdateSettings } from '@/features/settings/hooks';
import tr from '@/i18n/tr';

const schema = z.object({
  pages_per_point: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, '1-100 arası olmalı'),
  daily_goal_pages: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, '0 veya daha büyük olmalı'),
  daily_goal_bonus: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, '0 veya daha büyük olmalı'),
  allow_negative_points: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function PointsConfigScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();

  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      pages_per_point: '10',
      daily_goal_pages: '0',
      daily_goal_bonus: '0',
      allow_negative_points: false,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        pages_per_point: String(settings.pages_per_point),
        daily_goal_pages: String(settings.daily_goal_pages),
        daily_goal_bonus: String(settings.daily_goal_bonus),
        allow_negative_points: settings.allow_negative_points,
      });
    }
  }, [settings, reset]);

  const ppp = Number(watch('pages_per_point')) || 0;
  const dgp = Number(watch('daily_goal_pages')) || 0;
  const dgb = Number(watch('daily_goal_bonus')) || 0;

  const onSubmit = async (values: FormValues) => {
    try {
      await updateSettings.mutateAsync({
        pages_per_point: Number(values.pages_per_point),
        daily_goal_pages: Number(values.daily_goal_pages),
        daily_goal_bonus: Number(values.daily_goal_bonus),
        allow_negative_points: values.allow_negative_points,
      });
      Alert.alert('Başarılı', 'Ayarlar kaydedildi.');
      router.back();
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  if (isLoading) {
    return (
      <Screen title="Puan ve Okuma" showBack>
        <Text>Yükleniyor...</Text>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen title="Puan ve Okuma" showBack scroll>
        <ScrollView contentContainerStyle={{ gap: spacing.lg, paddingBottom: 40 }}>
          <View
            style={{
              backgroundColor: colors.warningSoft,
              padding: spacing.md,
              borderRadius: radius.lg,
            }}
          >
            <Text variant="captionSemi" color={colors.ink}>
              ⚠️ Uyarı
            </Text>
            <Text variant="caption" color={colors.ink} style={{ marginTop: 4 }}>
              Bu değişiklikler yalnızca bundan sonra hesaplanan günleri etkiler. Geçmişteki puanlar
              aynı kalır.
            </Text>
          </View>

          <Controller
            control={control}
            name="pages_per_point"
            render={({ field }) => (
              <Input
                label="Kaç sayfa 1 puan?"
                keyboardType="numeric"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.pages_per_point?.message}
                placeholder="Ör. 10"
              />
            )}
          />

          <Controller
            control={control}
            name="daily_goal_pages"
            render={({ field }) => (
              <Input
                label="Günlük Hedef (Sayfa)"
                keyboardType="numeric"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.daily_goal_pages?.message}
                placeholder="0 yazarsanız hedef kapanır"
              />
            )}
          />

          <Controller
            control={control}
            name="daily_goal_bonus"
            render={({ field }) => (
              <Input
                label="Hedefe Ulaşınca Bonus Puan"
                keyboardType="numeric"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.daily_goal_bonus?.message}
                placeholder="Ör. 5"
              />
            )}
          />

          <Controller
            control={control}
            name="allow_negative_points"
            render={({ field }) => (
              <SwitchRow
                label="Eksi Puanlara İzin Ver"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />

          {/* Canlı Önizleme */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: spacing.md,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text variant="captionSemi" color={colors.muted}>
              Canlı Önizleme
            </Text>
            <Text variant="body" color={colors.ink} style={{ marginTop: spacing.xs }}>
              {ppp > 0 ? `${ppp} sayfa = 1 puan.` : 'Geçersiz sayfa/puan oranı.'}
            </Text>
            {dgp > 0 && dgb > 0 && (
              <Text variant="body" color={colors.ink} style={{ marginTop: spacing.xs }}>
                Günde {dgp} sayfa okunursa toplam puana ek olarak +{dgb} bonus verilir.
              </Text>
            )}
          </View>

          <Button
            label={isSubmitting ? tr.common.saving : tr.common.save}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            fullWidth
          />
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}
