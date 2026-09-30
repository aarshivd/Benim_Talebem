/**
 * app/book/form.tsx — Kitap oluşturma / düzenleme modal.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useTheme } from '@/theme';
import { Screen, Text, Button, Input } from '@/components/ui';
import { useBook, useCreateBook, useUpdateBook } from '@/features/books/hooks';
import tr from '@/i18n/tr';

const schema = z.object({
  title: z.string().min(1, tr.validation.required).max(200, tr.validation.maxLength(200)),
  author: z.string().max(100, tr.validation.maxLength(100)).optional(),
  totalPages: z
    .string()
    .min(1, tr.validation.required)
    .refine((v) => Number(v) >= 1, { message: tr.validation.min(1) }),
});

type FormValues = z.infer<typeof schema>;

export default function BookFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const { spacing } = useTheme();

  const { data: book } = useBook(id ?? '');
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', author: '', totalPages: '' },
  });

  useEffect(() => {
    if (book) {
      reset({ title: book.title, author: book.author ?? '', totalPages: String(book.totalPages) });
    }
  }, [book, reset]);

  const onSubmit = async (values: FormValues) => {
    const data = {
      title: values.title.trim(),
      author: values.author?.trim() || null,
      totalPages: Number(values.totalPages),
    };
    if (isEdit && id) {
      await updateBook.mutateAsync({ id, data });
    } else {
      await createBook.mutateAsync(data);
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen title={isEdit ? 'Kitabı Düzenle' : 'Yeni Kitap'} showBack scroll>
        <View style={{ gap: spacing.lg, paddingBottom: 40 }}>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <Input label="Kitap Adı" placeholder="ör. Küçük Prens" value={field.value} onChangeText={field.onChange} error={errors.title?.message} autoFocus={!isEdit} />
            )}
          />
          <Controller
            control={control}
            name="author"
            render={({ field }) => (
              <Input label="Yazar (isteğe bağlı)" placeholder="ör. Antoine de Saint-Exupéry" value={field.value ?? ''} onChangeText={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="totalPages"
            render={({ field }) => (
              <Input label="Toplam Sayfa" placeholder="ör. 120" value={field.value} onChangeText={field.onChange} error={errors.totalPages?.message} keyboardType="numeric" />
            )}
          />
          <Button label={isSubmitting ? tr.common.saving : tr.common.save} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} fullWidth />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
