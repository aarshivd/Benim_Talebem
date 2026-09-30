/**
 * app/student/form.tsx
 * Talebe oluşturma / düzenleme modal ekranı.
 * ?id veya ?groupId parametresi desteklenir.
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
import { AvatarEmojis } from '@/theme/tokens';
import { Screen, Text, Button, Input, ChipGroup, EmojiPicker, Avatar } from '@/components/ui';
import { useStudent, useCreateStudent, useUpdateStudent, useDeleteStudent, useStudents } from '@/features/students/hooks';
import { useGroups } from '@/features/groups/hooks';
import tr from '@/i18n/tr';

// ─── Zod şeması ─────────────────────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(1, tr.validation.required).max(50, tr.validation.maxLength(50)),
  lastName: z.string().min(1, tr.validation.required).max(50, tr.validation.maxLength(50)),
  groupId: z.string().min(1, tr.validation.required),
  grade: z.string().optional(),
  avatar: z.string().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Component ──────────────────────────────────────────────────────────────

export default function StudentFormScreen() {
  const router = useRouter();
  const { id, groupId: paramGroupId } = useLocalSearchParams<{ id?: string; groupId?: string }>();
  const isEdit = !!id;
  const { colors, spacing } = useTheme();

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  const { data: student } = useStudent(id ?? '');
  const { data: groups = [] } = useGroups();
  const activeGroups = groups.filter((g) => !g.isArchived && g.deletedAt === null);

  // Duplicate name check
  const selectedGroupId = student?.groupId ?? paramGroupId ?? '';
  const { data: existingStudents = [] } = useStudents(selectedGroupId, { includeInactive: true });

  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      groupId: paramGroupId ?? '',
      grade: '',
      avatar: '',
      note: '',
    },
  });

  const watchedFirstName = watch('firstName');
  const watchedLastName = watch('lastName');
  const watchedAvatar = watch('avatar');

  // Düzenleme modunda doldur
  useEffect(() => {
    if (student) {
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        groupId: student.groupId,
        grade: student.grade ?? '',
        avatar: student.avatar ?? '',
        note: student.note ?? '',
      });
    }
  }, [student, reset]);

  const onSubmit = async (values: FormValues) => {
    // Duplicate check
    const normalizedFirst = values.firstName.trim().toLowerCase();
    const normalizedLast = values.lastName.trim().toLowerCase();
    const duplicate = existingStudents.find((s) => {
      if (isEdit && s.id === id) return false; // kendi kendine çakışma sayılmasın
      return (
        s.firstName.toLowerCase() === normalizedFirst &&
        s.lastName.toLowerCase() === normalizedLast &&
        s.groupId === values.groupId
      );
    });
    if (duplicate) {
      Alert.alert(
        'Mükerrer Kayıt',
        `Bu grupta "${values.firstName} ${values.lastName}" adında zaten bir talebe var.`,
        [{ text: tr.common.ok }],
      );
      return;
    }

    const data = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      groupId: values.groupId,
      grade: values.grade?.trim() || null,
      avatar: values.avatar || null,
      note: values.note?.trim() || null,
      isActive: true,
    };

    if (isEdit && id) {
      await updateStudent.mutateAsync({ id, data });
    } else {
      await createStudent.mutateAsync(data);
    }
    router.back();
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      tr.deleteDialog.title,
      'Talebeni silmek istediğinize emin misiniz? Okuma ve puan geçmişi de gizlenecek.',
      [
        { text: tr.deleteDialog.cancel, style: 'cancel' },
        {
          text: tr.deleteDialog.confirm,
          style: 'destructive',
          onPress: async () => {
            await deleteStudent.mutateAsync(id);
            router.back();
          },
        },
      ],
    );
  };

  const groupOptions = activeGroups.map((g) => ({
    label: `${g.emoji} ${g.name}`,
    value: g.id,
  }));

  const fullNamePreview = [watchedFirstName, watchedLastName].filter(Boolean).join(' ') || 'ÖN İZLEME';

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Screen
          title={isEdit ? 'Talebeyi Düzenle' : 'Talebe Ekle'}
          showBack
          scroll
        >
          <View style={[styles.form, { gap: spacing.lg }]}>
            {/* Avatar önizleme */}
            <View style={styles.avatarPreview}>
              <Pressable
                onPress={() => setEmojiPickerVisible(true)}
                accessibilityLabel={tr.a11y.selectEmoji}
              >
                <Avatar
                  name={fullNamePreview}
                  emoji={watchedAvatar || undefined}
                  size="xl"
                />
              </Pressable>
              <Text variant="caption" color={colors.muted} style={{ marginTop: spacing.sm }}>
                Avatar seçmek için dokun
              </Text>
            </View>

            {/* Ad */}
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => (
                <Input
                  label="Ad"
                  placeholder="ör. Fatma"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.firstName?.message}
                  autoFocus={!isEdit}
                  autoCapitalize="words"
                />
              )}
            />

            {/* Soyad */}
            <Controller
              control={control}
              name="lastName"
              render={({ field }) => (
                <Input
                  label="Soyad"
                  placeholder="ör. Yılmaz"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.lastName?.message}
                  autoCapitalize="words"
                />
              )}
            />

            {/* Grup seçimi */}
            {groupOptions.length > 0 && (
              <View>
                <Text variant="label" style={{ marginBottom: spacing.sm }}>Grup</Text>
                <Controller
                  control={control}
                  name="groupId"
                  render={({ field }) => (
                    <ChipGroup
                      options={groupOptions}
                      selected={field.value}
                      onSelect={(v) => field.onChange(v as string)}
                      scrollable
                    />
                  )}
                />
                {errors.groupId && (
                  <Text variant="caption" color={colors.danger} style={{ marginTop: spacing.xs }}>
                    {errors.groupId.message}
                  </Text>
                )}
              </View>
            )}

            {/* Sınıf */}
            <Controller
              control={control}
              name="grade"
              render={({ field }) => (
                <Input
                  label="Sınıf (isteğe bağlı)"
                  placeholder="ör. 6"
                  value={field.value ?? ''}
                  onChangeText={field.onChange}
                  keyboardType="numeric"
                />
              )}
            />

            {/* Not */}
            <Controller
              control={control}
              name="note"
              render={({ field }) => (
                <Input
                  label="Not (isteğe bağlı)"
                  placeholder="Talebe hakkında kısa not..."
                  value={field.value ?? ''}
                  onChangeText={field.onChange}
                  multiline
                  numberOfLines={3}
                />
              )}
            />

            {/* Kaydet */}
            <Button
              label={isSubmitting ? tr.common.saving : tr.common.save}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              fullWidth
            />

            {/* Sil */}
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

      {/* Avatar EmojiPicker */}
      <Controller
        control={control}
        name="avatar"
        render={({ field }) => (
          <EmojiPicker
            visible={emojiPickerVisible}
            onClose={() => setEmojiPickerVisible(false)}
            onSelect={(emoji) => {
              field.onChange(emoji);
              setEmojiPickerVisible(false);
            }}
            emojis={AvatarEmojis}
            selected={field.value ?? ''}
            title="Avatar Seç"
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
  avatarPreview: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
