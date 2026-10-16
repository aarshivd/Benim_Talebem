/**
 * app/settings/rewards/form.tsx
 * Ödül ekle/düzenle formu ve canlı önizleme.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useTheme } from '@/theme';
import { Screen, Text, Button, Input, SwitchRow, Segmented, EmojiPicker } from '@/components/ui';
import {
  useReward,
  useCreateReward,
  useUpdateReward,
  useDeleteReward,
} from '@/features/rewards/hooks';
import { useRanking } from '@/features/ranking/hooks';
import { useActiveTerm } from '@/features/terms/hooks';
import { todayLocal } from '@/domain';
import tr from '@/i18n/tr';

const schema = z
  .object({
    name: z.string().min(1, 'Ödül adı gerekli'),
    description: z.string().optional(),
    icon: z.string().min(1),
    scope: z.enum(['daily', 'term']),
    kind: z.enum(['points', 'rank']),
    targetPoints: z.string().optional(),
    rankTop: z.string().optional(),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.kind === 'points') return !!data.targetPoints && Number(data.targetPoints) > 0;
      return true;
    },
    { message: 'Hedef puan gerekli ve sıfırdan büyük olmalı', path: ['targetPoints'] },
  )
  .refine(
    (data) => {
      if (data.kind === 'rank') return !!data.rankTop && Number(data.rankTop) > 0;
      return true;
    },
    { message: 'Sıra numarası gerekli ve sıfırdan büyük olmalı', path: ['rankTop'] },
  );

type FormValues = z.infer<typeof schema>;

export default function RewardFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const { data: reward, isLoading } = useReward(id ?? '');
  const createReward = useCreateReward();
  const updateReward = useUpdateReward();
  const deleteReward = useDeleteReward();

  const { data: activeTerm } = useActiveTerm();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      icon: '🏆',
      scope: 'daily',
      kind: 'points',
      targetPoints: '',
      rankTop: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (reward) {
      reset({
        name: reward.name,
        description: reward.description || '',
        icon: reward.icon,
        scope: reward.scope,
        kind: reward.kind,
        targetPoints: reward.targetPoints ? String(reward.targetPoints) : '',
        rankTop: reward.rankTop ? String(reward.rankTop) : '',
        isActive: reward.isActive,
      });
    }
  }, [reward, reset]);

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const watchedIcon = watch('icon');
  const watchedScope = watch('scope');
  const watchedKind = watch('kind');
  const watchedTarget = Number(watch('targetPoints')) || 0;
  const watchedRank = Number(watch('rankTop')) || 0;

  // Canlı önizleme için verileri çek
  const rankingOptions = {
    scope: watchedScope,
    day: watchedScope === 'daily' ? todayLocal() : undefined,
    termId: watchedScope === 'term' ? activeTerm?.id : undefined,
  };
  const { data: rankingData } = useRanking(rankingOptions);
  const rankedRows = rankingData?.rankedRows ?? [];

  const previewCount = useMemo(() => {
    let count = 0;
    if (watchedKind === 'points' && watchedTarget > 0) {
      count = rankedRows.filter((r) => r.points >= watchedTarget).length;
    } else if (watchedKind === 'rank' && watchedRank > 0) {
      count = rankedRows.filter((r) => r.rank !== null && r.rank <= watchedRank).length;
    }
    return count;
  }, [rankedRows, watchedKind, watchedTarget, watchedRank]);

  const onSubmit = async (values: FormValues) => {
    try {
      const data = {
        name: values.name,
        description: values.description || null,
        icon: values.icon,
        scope: values.scope,
        kind: values.kind,
        targetPoints: values.kind === 'points' ? Number(values.targetPoints) : null,
        rankTop: values.kind === 'rank' ? Number(values.rankTop) : null,
        isActive: values.isActive,
      };

      if (id) {
        await updateReward.mutateAsync({ id, data });
      } else {
        await createReward.mutateAsync(data);
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Sil',
      'Bu ödülü silmek istediğinize emin misiniz? Eski kayıtlarda görünmeye devam etse de yeni kazanılamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteReward.mutateAsync(id);
              router.back();
            }
          },
        },
      ],
    );
  };

  if (id && isLoading)
    return (
      <Screen>
        <Text>Yükleniyor...</Text>
      </Screen>
    );

  return (
    <Screen>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Button label="İptal" variant="secondary" size="sm" onPress={() => router.back()} />
        <Text variant="heading" color={colors.ink}>
          {id ? 'Ödülü Düzenle' : 'Yeni Ödül'}
        </Text>
        <Button
          label="Kaydet"
          variant="primary"
          size="sm"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.base, gap: spacing.lg, paddingBottom: 60 }}
      >
        {/* Canlı Önizleme Alanı */}
        <View
          style={{
            backgroundColor: colors.surface,
            padding: spacing.md,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
          }}
        >
          <Text variant="captionSemi" color={colors.muted}>
            Canlı Önizleme ({watchedScope === 'daily' ? 'Bugün' : 'Bu Dönem'})
          </Text>
          <Text
            variant="body"
            color={colors.ink}
            style={{ marginTop: spacing.sm, textAlign: 'center' }}
          >
            Şu anki verilere göre bu ödülü{' '}
            <Text style={{ fontWeight: 'bold' }}>{previewCount}</Text> talebe kazanırdı.
          </Text>
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label="Ödül Adı"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Input
              label="Kısa Açıklama (İsteğe Bağlı)"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        <View>
          <Text variant="label" color={colors.muted} style={{ marginBottom: spacing.xs }}>
            İkon
          </Text>
          <Pressable
            onPress={() => setEmojiPickerVisible(true)}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 32 }}>{watchedIcon}</Text>
          </Pressable>
        </View>

        <Controller
          control={control}
          name="scope"
          render={({ field }) => (
            <View>
              <Text variant="label" color={colors.muted} style={{ marginBottom: spacing.xs }}>
                Kapsam
              </Text>
              <Segmented
                options={[
                  { label: 'Günlük', value: 'daily' },
                  { label: 'Dönemlik', value: 'term' },
                ]}
                selected={field.value}
                onSelect={(val) => field.onChange(val as 'daily' | 'term')}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <View>
              <Text variant="label" color={colors.muted} style={{ marginBottom: spacing.xs }}>
                Tür
              </Text>
              <Segmented
                options={[
                  { label: 'Puan Hedefi', value: 'points' },
                  { label: 'İlk N Sıra', value: 'rank' },
                ]}
                selected={field.value}
                onSelect={(val) => field.onChange(val as 'points' | 'rank')}
              />
            </View>
          )}
        />

        {watchedKind === 'points' && (
          <Controller
            control={control}
            name="targetPoints"
            render={({ field }) => (
              <Input
                label="Hedef Puan"
                keyboardType="numeric"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.targetPoints?.message}
              />
            )}
          />
        )}

        {watchedKind === 'rank' && (
          <Controller
            control={control}
            name="rankTop"
            render={({ field }) => (
              <Input
                label="İlk Kaçıncı Sıraya Verilecek?"
                keyboardType="numeric"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.rankTop?.message}
              />
            )}
          />
        )}

        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <SwitchRow label="Aktif" value={field.value} onValueChange={field.onChange} />
          )}
        />

        {!!id && (
          <Button
            label="Bu Ödülü Sil"
            variant="danger"
            onPress={handleDelete}
            style={{ marginTop: spacing.md }}
          />
        )}
      </ScrollView>

      <EmojiPicker
        visible={emojiPickerVisible}
        onClose={() => setEmojiPickerVisible(false)}
        emojis={['🏆', '⭐', '🥇', '🥈', '🥉', '🏅', '🎯', '🚀', '👑', '🌟', '💎', '🎉']}
        selected={watchedIcon}
        onSelect={(emoji) => {
          setValue('icon', emoji);
          setEmojiPickerVisible(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
});
