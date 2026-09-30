/**
 * app/group/form.tsx
 * Grup oluşturma / düzenleme modal ekranı.
 * ?id param verilirse düzenleme modunda açılır.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';

import { useTheme } from '@/theme';
import { GroupPalette, GroupEmojis } from '@/theme/tokens';
import { Screen, Text, Button, Input, ChipGroup, ColorPicker, EmojiPicker } from '@/components/ui';
import {
  useGroup,
  useCreateGroup,
  useUpdateGroup,
  useArchiveGroup,
  useDeleteGroup,
} from '@/features/groups/hooks';
import { useStudents } from '@/features/students/hooks';
import tr from '@/i18n/tr';

// ─── Zod şeması ─────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, tr.validation.required).max(50, tr.validation.maxLength(50)),
  level: z.enum(['ilkokul', 'ortaokul', 'lise', 'universite']),
  color: z.number().min(0).max(GroupPalette.length - 1),
  emoji: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

const LEVEL_OPTIONS = [
  { label: 'İlkokul', value: 'ilkokul' },
  { label: 'Ortaokul', value: 'ortaokul' },
  { label: 'Lise', value: 'lise' },
  { label: 'Üniversite', value: 'universite' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function GroupFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const { spacing, radius } = useTheme();

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  const { data: group } = useGroup(id ?? '');
  const { data: studentsData } = useStudents(id ?? '');
  const hasStudents = (studentsData?.length ?? 0) > 0;

  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const archiveGroup = useArchiveGroup();
  const deleteGroup = useDeleteGroup();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      level: 'ortaokul',
      color: 0,
      emoji: '📚',
    },
  });

  const selectedColor = watch('color');

  // Düzenleme modunda mevcut değerleri doldur
  useEffect(() => {
    if (group) {
      reset({
        name: group.name,
        level: group.level,
        color: group.color,
        emoji: group.emoji,
      });
    }
  }, [group, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit && id) {
      await updateGroup.mutateAsync({ id, data: values });
    } else {
      await createGroup.mutateAsync({
        ...values,
        isArchived: false,
        sortOrder: 0,
      });
    }
    router.back();
  };

  const handleArchiveToggle = async () => {
    if (!id || !group) return;
    await archiveGroup.mutateAsync({ id, archive: !group.isArchived });
    router.back();
  };

  const handleDelete = () => {
    if (!id) return;
    if (hasStudents) {
      Alert.alert(
        'Grup Silinemez',
        'Bu grupta talebelerin var. Grubu silmeden önce tüm talebeleri başka bir gruba taşı veya sil. Alternatif olarak grubu arşivleyebilirsin.',
        [{ text: tr.common.ok }],
      );
      return;
    }
    Alert.alert(
      tr.deleteDialog.title,
      tr.deleteDialog.message,
      [
        { text: tr.deleteDialog.cancel, style: 'cancel' },
        {
          text: tr.deleteDialog.confirm,
          style: 'destructive',
          onPress: async () => {
            await deleteGroup.mutateAsync(id);
            router.back();
          },
        },
      ],
    );
  };

  const colorItem = GroupPalette[selectedColor] ?? GroupPalette[0];

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Screen
          title={isEdit ? 'Grubu Düzenle' : 'Yeni Grup'}
          showBack
          rightSlot={
            isEdit ? (
              <Button
                label={group?.isArchived ? 'Geri Al' : 'Arşivle'}
                variant="ghost"
                size="sm"
                onPress={handleArchiveToggle}
              />
            ) : undefined
          }
          scroll
        >
          <View style={[styles.form, { gap: spacing.lg }]}>
            {/* Emoji + renk önizlemesi */}
            <View style={styles.previewRow}>
              <Controller
                control={control}
                name="emoji"
                render={({ field }) => (
                  <Pressable
                    onPress={() => setEmojiPickerVisible(true)}
                    style={[
                      styles.emojiButton,
                      {
                        backgroundColor: colorItem.bg,
                        borderColor: colorItem.border,
                        borderRadius: radius.xl,
                      },
                    ]}
                    accessibilityLabel={tr.a11y.selectEmoji}
                  >
                    <Text variant="display" style={{ fontSize: 40 }}>{field.value}</Text>
                  </Pressable>
                )}
              />
            </View>

            {/* Ad */}
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  label="Grup Adı"
                  placeholder="ör. 6-A Sınıfı"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.name?.message}
                  autoFocus={!isEdit}
                />
              )}
            />

            {/* Seviye */}
            <View>
              <Text variant="label" style={{ marginBottom: spacing.sm }}>Seviye</Text>
              <Controller
                control={control}
                name="level"
                render={({ field }) => (
                  <ChipGroup
                    options={LEVEL_OPTIONS}
                    selected={field.value}
                    onSelect={(v) => field.onChange(v as string)}
                  />
                )}
              />
            </View>

            {/* Renk */}
            <View>
              <Text variant="label" style={{ marginBottom: spacing.sm }}>Renk</Text>
              <Controller
                control={control}
                name="color"
                render={({ field }) => (
                  <ColorPicker
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                )}
              />
            </View>

            {/* Kaydet */}
            <Button
              label={isSubmitting ? tr.common.saving : tr.common.save}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              fullWidth
            />

            {/* Sil (sadece düzenleme) */}
            {isEdit && (
              <Button
                label={tr.common.delete}
                variant="danger"
                onPress={handleDelete}
                fullWidth
              />
            )}
          </View>
        </Screen>
      </KeyboardAvoidingView>

      {/* Emoji Picker BottomSheet */}
      <Controller
        control={control}
        name="emoji"
        render={({ field }) => (
          <EmojiPicker
            visible={emojiPickerVisible}
            onClose={() => setEmojiPickerVisible(false)}
            onSelect={(emoji) => {
              field.onChange(emoji);
              setEmojiPickerVisible(false);
            }}
            emojis={GroupEmojis}
            selected={field.value}
            title="Grup Emojisi Seç"
          />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingBottom: 40,
  },
  previewRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emojiButton: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
