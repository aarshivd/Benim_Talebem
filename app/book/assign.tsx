/**
 * app/book/assign.tsx
 * Talebeye kitap atama modalı. ?studentId zorunlu.
 */

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Screen, Text, Button, Input, ProgressBar } from '@/components/ui';
import { useBooks, useAssignBook, useStudentBooks } from '@/features/books/hooks';
import tr from '@/i18n/tr';
import type { Book } from '@/db/schema';

export default function AssignBookScreen() {
  const router = useRouter();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const { colors, spacing, radius, shadows } = useTheme();

  const [search, setSearch] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [startPage, setStartPage] = useState('0');

  const { data: allBooks = [] } = useBooks();
  const { data: studentBooks = [] } = useStudentBooks(studentId);
  const assignBook = useAssignBook();

  // Zaten atanmış book ID'leri
  const assignedBookIds = new Set(studentBooks.map((sb) => sb.bookId));

  const filtered = allBooks.filter((b) =>
    !search.trim() || b.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAssign = async () => {
    if (!selectedBookId) return;
    const sp = parseInt(startPage, 10);
    try {
      await assignBook.mutateAsync({ studentId, bookId: selectedBookId, startPage: isNaN(sp) ? 0 : sp });
      router.back();
    } catch (e: any) {
      Alert.alert('Hata', e.message ?? tr.snackbar.error);
    }
  };

  const renderBook = ({ item }: { item: Book }) => {
    const isAssigned = assignedBookIds.has(item.id);
    const isSelected = selectedBookId === item.id;

    return (
      <Pressable
        onPress={() => { if (!isAssigned) setSelectedBookId(item.id); }}
        disabled={isAssigned}
        style={[
          styles.bookRow,
          {
            backgroundColor: isSelected ? colors.primarySoft : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: 1,
            borderRadius: radius.lg,
            padding: spacing.base,
            marginBottom: spacing.sm,
            opacity: isAssigned ? 0.5 : 1,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text variant="bodySemi" color={colors.ink}>{item.title}</Text>
          {item.author ? <Text variant="caption" color={colors.muted}>{item.author}</Text> : null}
          <Text variant="caption" color={colors.muted}>{item.totalPages} sayfa</Text>
          {isAssigned && <Text variant="caption" color={colors.warning}>Zaten atanmış</Text>}
        </View>
        {isSelected && <Text variant="body" color={colors.primary}>✓</Text>}
      </Pressable>
    );
  };

  return (
    <Screen title="Kitap Ata" showBack>
      <Input
        placeholder="Kitap ara…"
        value={search}
        onChangeText={setSearch}
        leftIcon="search"
      />
      <View style={{ marginVertical: spacing.md }}>
        <FlatList
          data={filtered}
          keyExtractor={(b) => b.id}
          renderItem={renderBook}
          scrollEnabled={false}
          ListEmptyComponent={<Text variant="body" color={colors.muted} align="center">Kitap bulunamadı.</Text>}
        />
      </View>

      {/* Başlangıç sayfası */}
      {selectedBookId && (
        <View style={{ marginBottom: spacing.lg }}>
          <Input
            label="Başlangıç sayfası (varsayılan 0)"
            placeholder="0"
            value={startPage}
            onChangeText={setStartPage}
            keyboardType="numeric"
          />
        </View>
      )}

      <Button
        label="Kitabı Ata"
        onPress={handleAssign}
        disabled={!selectedBookId || assignBook.isPending}
        fullWidth
      />

      <View style={{ marginTop: spacing.md }}>
        <Button
          label="Yeni Kitap Ekle"
          variant="secondary"
          onPress={() => router.push('/book/form')}
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ bookRow: {} });
