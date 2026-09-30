/**
 * app/settings/terms/form.tsx
 * Dönem ekle/düzenle formu.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useTheme } from '@/theme';
import { Screen, Text, Button, Input, SwitchRow } from '@/components/ui';
import { useTerms, useTerm, useActiveTerm, useCreateTerm, useUpdateTerm, useDeleteTerm, useSetActiveTerm } from '@/features/terms/hooks';
import { hasOverlap, isValidDay, addDays, todayLocal } from '@/domain';
import tr from '@/i18n/tr';

const schema = z.object({
  name: z.string().min(1, 'Dönem adı gerekli'),
  startDate: z.string().refine(isValidDay, 'Geçerli bir tarih girin (YYYY-MM-DD)'),
  endDate: z.string().refine(isValidDay, 'Geçerli bir tarih girin (YYYY-MM-DD)'),
  isActive: z.boolean(),
}).refine(data => data.startDate <= data.endDate, {
  message: 'Bitiş tarihi başlangıçtan önce olamaz',
  path: ['endDate'],
});

type FormValues = z.infer<typeof schema>;

export default function TermFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const { data: terms = [] } = useTerms();
  const { data: term, isLoading } = useTerm(id ?? '');
  const { data: activeTerm } = useActiveTerm();

  const createTerm = useCreateTerm();
  const updateTerm = useUpdateTerm();
  const deleteTerm = useDeleteTerm();
  const setTermActive = useSetActiveTerm();

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      startDate: todayLocal(),
      endDate: addDays(todayLocal(), 90), // default 90 gün
      isActive: true,
    },
  });

  useEffect(() => {
    if (term) {
      reset({
        name: term.name,
        startDate: term.startDate,
        endDate: term.endDate,
        isActive: term.isActive,
      });
    } else if (!id && activeTerm) {
      // "Yeni dönem başlat" sihirbazı varsayımları:
      // Aktif dönemin bitişinden 1 gün sonra başlar, 90 gün sürer.
      const nextStart = addDays(activeTerm.endDate, 1);
      reset({
        name: 'Yeni Dönem',
        startDate: nextStart,
        endDate: addDays(nextStart, 90),
        isActive: true, // varsayılan olarak bunu aktif yapmak isteyebilir
      });
    }
  }, [term, activeTerm, id, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Çakışma kontrolü
      const overlapping = terms.find(t => t.id !== id && hasOverlap(t, { startDate: values.startDate, endDate: values.endDate }));
      if (overlapping) {
        Alert.alert('Tarih Çakışması', `Seçilen tarihler "${overlapping.name}" dönemi ile çakışıyor. Lütfen farklı bir tarih aralığı seçin.`);
        return;
      }

      if (id) {
        await updateTerm.mutateAsync({ id, data: { name: values.name, startDate: values.startDate, endDate: values.endDate } });
        if (values.isActive && activeTerm?.id !== id) {
          await setTermActive.mutateAsync(id);
        }
      } else {
        const created = await createTerm.mutateAsync({ name: values.name, startDate: values.startDate, endDate: values.endDate });
        if (values.isActive) {
          await setTermActive.mutateAsync(created.id);
        }
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  const handleDelete = () => {
    Alert.alert('Sil', 'Dönemi silmek istediğinize emin misiniz? (Öğrenci puanları kaybolmaz, sadece dönemden kopar)', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          if (id) {
            await deleteTerm.mutateAsync(id);
            router.back();
          }
        },
      },
    ]);
  };

  if (id && isLoading) return <Screen><Text>Yükleniyor...</Text></Screen>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={styles.header}>
          <Button label="İptal" variant="secondary" size="sm" onPress={() => router.back()} />
          <Text variant="heading" color={colors.ink}>{id ? 'Dönemi Düzenle' : 'Yeni Dönem Başlat'}</Text>
          <Button label="Kaydet" variant="primary" size="sm" onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.base, gap: spacing.lg, paddingBottom: 60 }}>
          
          {!id && activeTerm && (
            <View style={{ backgroundColor: colors.primarySoft, padding: spacing.md, borderRadius: radius.lg }}>
              <Text variant="captionSemi" color={colors.primaryDark}>Yeni Dönem Sihirbazı</Text>
              <Text variant="caption" color={colors.ink} style={{ marginTop: 4 }}>
                Mevcut aktif dönem "{activeTerm.name}" ({activeTerm.endDate} tarihinde bitiyor). Yeni dönem başlattığınızda güncel öğrenci puanları eski döneme ait olarak korunur ve sıralama sıfırlanır. Öğrenciler ve gruplar aynen kalır.
              </Text>
            </View>
          )}

          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input label="Dönem Adı" value={field.value} onChangeText={field.onChange} error={errors.name?.message} placeholder="Ör: 2026 Güz Dönemi" />
            )}
          />

          {/* Tarihler için yerleşik DateTimePicker vb. kullanılabilir ama metin tabanlı (YYYY-MM-DD) basit bırakıyoruz */}
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <Input label="Başlangıç Tarihi" value={field.value} onChangeText={field.onChange} error={errors.startDate?.message} placeholder="YYYY-MM-DD" />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <Input label="Bitiş Tarihi" value={field.value} onChangeText={field.onChange} error={errors.endDate?.message} placeholder="YYYY-MM-DD" />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <SwitchRow label="Aktif Dönem Yap" value={field.value} onValueChange={field.onChange} />
            )}
          />

          {!!id && (
            <Button label="Dönemi Sil" variant="danger" onPress={handleDelete} style={{ marginTop: spacing.md }} />
          )}
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EADFCF',
  },
});
