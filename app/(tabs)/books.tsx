/**
 * app/(tabs)/books.tsx
 * Kitaplar sekmesi: arama, liste, FAB.
 */

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Screen, Text, FAB, EmptyState, Input, ProgressBar, Badge } from '@/components/ui';
import { useBooks, useDeleteBook, useBookReaders } from '@/features/books/hooks';
import tr from '@/i18n/tr';
import type { Book } from '@/db/schema';

function BookCard({ item, onPress, onDelete }: { item: Book; onPress: () => void; onDelete: () => void }) {
  const { colors, spacing, radius, shadows } = useTheme();
  const { data: readers = [] } = useBookReaders(item.id);
  const readerCount = readers.length;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          marginBottom: spacing.md,
          padding: spacing.base,
          ...shadows.sm,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View style={{ flex: 1 }}>
        <Text variant="bodySemi" color={colors.ink} numberOfLines={1}>{item.title}</Text>
        {item.author ? (
          <Text variant="caption" color={colors.muted}>{item.author}</Text>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs }}>
          <Text variant="caption" color={colors.muted}>{item.totalPages} sayfa</Text>
          {readerCount > 0 && (
            <Badge label={`${readerCount} talebe okuyor`} variant="primary" />
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function BooksScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const [search, setSearch] = useState('');
  const { data: books = [], isLoading, refetch } = useBooks();
  const deleteBook = useDeleteBook();

  const filtered = books.filter((b) =>
    !search.trim() ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    (b.author?.toLowerCase().includes(search.toLowerCase()) ?? false),
  );

  const handleDelete = (book: Book) => {
    Alert.alert(
      tr.deleteDialog.title,
      'Okuyanı olan kitap silinemez.',
      [
        { text: tr.deleteDialog.cancel, style: 'cancel' },
        {
          text: tr.deleteDialog.confirm,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBook.mutateAsync(book.id);
            } catch (e: any) {
              Alert.alert('Hata', e.message ?? tr.snackbar.error);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen title="Kitaplar">
      <View style={{ marginBottom: spacing.md }}>
        <Input
          placeholder="Kitap veya yazar ara…"
          value={search}
          onChangeText={setSearch}
          leftIcon="search"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
            item={item}
            onPress={() => router.push(`/book/${item.id}`)}
            onDelete={() => handleDelete(item)}
          />
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState
            emoji="📖"
            title={tr.empty.books}
            actionLabel="Kitap Ekle"
            onAction={() => router.push('/book/form')}
          />
        }
      />

      <FAB icon="add" onPress={() => router.push('/book/form')} accessibilityLabel="Kitap ekle" />
    </Screen>
  );
}

const styles = StyleSheet.create({ card: { flexDirection: 'row' } });
