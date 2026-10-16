/**
 * app/book/[id].tsx — Kitap detay: okuyan listesi + ilerleme.
 */

import React from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Screen, Text, Button, IconButton, ProgressBar, EmptyState } from '@/components/ui';
import { useBook, useDeleteBook, useBookReaders } from '@/features/books/hooks';
import { useStudents } from '@/features/students/hooks';
import tr from '@/i18n/tr';
import type { StudentBook } from '@/db/schema';

const STATUS_LABELS = { reading: 'Okuyor', finished: 'Bitirdi', paused: 'Duraklattı' } as const;

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius, shadows } = useTheme();

  const { data: book } = useBook(id);
  const { data: readers = [] } = useBookReaders(id);
  const deleteBook = useDeleteBook();

  const handleDelete = () => {
    if (readers.length > 0) {
      Alert.alert(
        'Silinemez',
        'Bu kitabı okuyan talebe var. Önce kitabı tüm talebelerin listesinden kaldır veya bekle.',
      );
      return;
    }
    Alert.alert(tr.deleteDialog.title, tr.deleteDialog.message, [
      { text: tr.deleteDialog.cancel, style: 'cancel' },
      {
        text: tr.deleteDialog.confirm,
        style: 'destructive',
        onPress: async () => {
          await deleteBook.mutateAsync(id);
          router.back();
        },
      },
    ]);
  };

  if (!book)
    return (
      <Screen title="Kitap" showBack>
        <EmptyState emoji="📖" title="Kitap bulunamadı." />
      </Screen>
    );

  const renderReader = ({ item }: { item: StudentBook }) => {
    const pct = book.totalPages > 0 ? item.currentPage / book.totalPages : 0;
    return (
      <View
        style={[
          styles.readerRow,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.base,
            marginBottom: spacing.sm,
            ...shadows.sm,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text variant="body" color={colors.ink}>
            {item.studentId}
          </Text>
          <Text variant="caption" color={colors.muted}>
            {STATUS_LABELS[item.status]} — {item.currentPage}/{book.totalPages} sayfa
          </Text>
          <View style={{ marginTop: spacing.xs }}>
            <ProgressBar progress={pct} height={6} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen
      title={book.title}
      showBack
      rightSlot={
        <IconButton
          icon="create-outline"
          onPress={() => router.push(`/book/form?id=${id}`)}
          accessibilityLabel={tr.common.edit}
          color={colors.ink}
        />
      }
    >
      <View style={{ marginBottom: spacing.xl }}>
        {book.author ? (
          <Text variant="body" color={colors.muted}>
            {book.author}
          </Text>
        ) : null}
        <Text variant="caption" color={colors.muted}>
          {book.totalPages} sayfa · {readers.length} okuyan
        </Text>
      </View>

      <FlatList
        data={readers}
        keyExtractor={(r) => r.id}
        renderItem={renderReader}
        scrollEnabled={false}
        ListEmptyComponent={<EmptyState emoji="👤" title="Henüz okuyan yok." />}
      />

      <View style={{ marginTop: spacing.xl }}>
        <Button label="Kitabı Sil" variant="danger" onPress={handleDelete} fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ readerRow: {} });
