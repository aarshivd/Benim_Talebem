/**
 * app/settings/point-rules/form.tsx
 * Puan kuralı oluşturma / düzenleme formu.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useTheme } from '@/theme';
import { Screen, Text, Button, Input, ChipGroup, EmojiPicker } from '@/components/ui';
import { usePointRule, useCreatePointRule, useUpdatePointRule } from '@/features/points/hooks';
import { useQuery } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks';
import tr from '@/i18n/tr';

// Zod şeması component içinde oluşturulmalı çünkü ayarlara göre değişiyor.

export default function PointRuleFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const { spacing, colors, radius } = useTheme();

  const { data: settings } = useSettings();
  const allowNegative = settings?.allow_negative_points ?? false;

  const schema = z.object({
    name: z.string().min(1, tr.validation.required).max(100),
    points: z
      .string()
      .min(1, tr.validation.required)
      .refine(
        (val) => {
          const num = Number(val);
          if (isNaN(num)) return false;
          if (num === 0) return false;
          if (!allowNegative && num < 0) return false;
          if (num < -100 || num > 100) return false;
          return true;
        },
        { message: allowNegative ? '-100 ile 100 arası (0 hariç)' : '1 ile 100 arası' },
      ),
    category: z.enum(['soru', 'davranis', 'gorev', 'ozel']),
    icon: z.string().min(1, 'İkon seçilmeli'),
  });

  type FormValues = z.infer<typeof schema>;

  const { data: rule } = usePointRule(id ?? '');
  const createRule = useCreatePointRule();
  const updateRule = useUpdatePointRule();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', points: '', category: 'soru', icon: '⭐' },
  });

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const watchedIcon = watch('icon');

  useEffect(() => {
    if (rule) {
      reset({
        name: rule.name,
        points: String(rule.points),
        category: rule.category,
        icon: rule.icon,
      });
    }
  }, [rule, reset]);

  const onSubmit = async (values: FormValues) => {
    const data = {
      name: values.name.trim(),
      points: Number(values.points),
      category: values.category,
      icon: values.icon,
      isActive: rule ? rule.isActive : true,
      sortOrder: rule ? rule.sortOrder : 999, // default last
    };

    if (isEdit && id) {
      await updateRule.mutateAsync({ id, data });
    } else {
      await createRule.mutateAsync(data);
    }
    router.back();
  };

  const CATEGORY_OPTIONS = [
    { label: 'Soru', value: 'soru' },
    { label: 'Davranış', value: 'davranis' },
    { label: 'Görev', value: 'gorev' },
    { label: 'Özel', value: 'ozel' },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen title={isEdit ? 'Kuralı Düzenle' : 'Yeni Kural'} showBack scroll>
        <View style={{ gap: spacing.lg, paddingBottom: 40 }}>
          <View style={{ alignItems: 'center', marginBottom: spacing.sm }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: radius.full,
                backgroundColor: colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 40 }}>{watchedIcon}</Text>
            </View>
            <Button
              label="İkon Seç"
              variant="ghost"
              size="sm"
              onPress={() => setEmojiPickerVisible(true)}
            />
          </View>

          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                label="Kural Adı"
                placeholder="ör. Derste soruyu bildi"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.name?.message}
                autoFocus={!isEdit}
              />
            )}
          />

          <Controller
            control={control}
            name="points"
            render={({ field }) => (
              <Input
                label="Puan"
                placeholder={allowNegative ? '-100 ile 100 arası' : '1 ile 100 arası'}
                value={field.value}
                onChangeText={field.onChange}
                error={errors.points?.message}
                keyboardType="numbers-and-punctuation"
              />
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <View>
                <Text variant="label" style={{ marginBottom: spacing.sm }}>
                  Kategori
                </Text>
                <ChipGroup
                  options={CATEGORY_OPTIONS}
                  selected={field.value}
                  onSelect={field.onChange}
                />
                {errors.category && (
                  <Text variant="caption" color={colors.danger}>
                    {errors.category.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Button
            label={isSubmitting ? tr.common.saving : tr.common.save}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            fullWidth
          />
        </View>

        <EmojiPicker
          visible={emojiPickerVisible}
          emojis={[
            '⭐',
            '👍',
            '🌟',
            '🏆',
            '💯',
            '👏',
            '🎯',
            '🚀',
            '💡',
            '📚',
            '🤝',
            '🧹',
            '🎨',
            '🧩',
            '🎈',
            '🎉',
          ]}
          onClose={() => setEmojiPickerVisible(false)}
          onSelect={(emoji) => {
            setValue('icon', emoji);
            setEmojiPickerVisible(false);
          }}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

// I need useSettings hook if I used it, but I don't have it explicitly created in db/repositories/settings.hooks.ts yet.
// I will just use react-query directly to get settings.
