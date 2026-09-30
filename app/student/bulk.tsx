/**
 * app/student/bulk.tsx
 * Toplu talebe ekleme ekranı.
 * Her satır bir talebe: "Ad Soyad"
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTheme } from '@/theme';
import { Screen, Text, Button, Input } from '@/components/ui';
import { useGroups } from '@/features/groups/hooks';
import { useBulkCreateStudents, useStudents } from '@/features/students/hooks';
import tr from '@/i18n/tr';

interface ParsedLine {
  index: number;
  raw: string;
  firstName?: string;
  lastName?: string;
  error?: string;
}

function parseLine(raw: string): Omit<ParsedLine, 'index'> {
  const trimmed = raw.trim();
  if (!trimmed) return { raw, error: 'Boş satır' };
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return { raw, error: 'Soyad eksik (Ad Soyad formatı gerekli)' };
  const firstName = parts.slice(0, -1).join(' ');
  const lastName = parts[parts.length - 1];
  return { raw, firstName, lastName };
}

export default function BulkStudentScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { colors, spacing, radius } = useTheme();

  const [rawText, setRawText] = useState('');
  const { data: groups = [] } = useGroups();
  const { data: existing = [] } = useStudents(groupId, { includeInactive: true });
  const bulkCreate = useBulkCreateStudents();

  const group = groups.find((g) => g.id === groupId);

  const parsedLines = useMemo<ParsedLine[]>(() => {
    return rawText
      .split('\n')
      .map((raw, index) => ({ index, ...parseLine(raw) }));
  }, [rawText]);

  const validLines = parsedLines.filter((l) => !l.error && l.firstName);
  const invalidLines = parsedLines.filter((l) => !!l.error && l.raw.trim());

  // Duplicate check against existing
  const withDuplicates = useMemo(() => {
    return validLines.map((l) => {
      const isDuplicate = existing.some(
        (s) =>
          s.firstName.toLowerCase() === l.firstName?.toLowerCase() &&
          s.lastName?.toLowerCase() === l.lastName?.toLowerCase(),
      );
      return { ...l, isDuplicate };
    });
  }, [validLines, existing]);

  const handleAdd = async () => {
    const toCreate = withDuplicates.filter((l) => !l.isDuplicate);
    if (toCreate.length === 0) {
      Alert.alert('Eklenecek talebe yok', 'Geçerli ve yeni talebe satırı bulunamadı.');
      return;
    }

    await bulkCreate.mutateAsync(
      toCreate.map((l) => ({
        firstName: l.firstName!,
        lastName: l.lastName!,
        groupId,
        isActive: true,
        avatar: null,
        grade: null,
        note: null,
      })),
    );

    router.back();
  };

  const canSubmit = withDuplicates.some((l) => !l.isDuplicate);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen
        title="Toplu Talebe Ekle"
        showBack
        rightSlot={
          group ? (
            <Text variant="caption" color={colors.muted} numberOfLines={1}>
              {group.emoji} {group.name}
            </Text>
          ) : undefined
        }
      >
        <View style={[styles.container, { gap: spacing.lg }]}>
          {/* Açıklama */}
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: colors.primarySoft,
                borderRadius: radius.lg,
                padding: spacing.base,
              },
            ]}
          >
            <Text variant="caption" color={colors.primary}>
              Her satıra bir talebe yazın: <Text variant="captionSemi" color={colors.primary}>Ad Soyad</Text>
              {'\n'}Örnek:{'\n'}Ali Veli{'\n'}Fatma Yılmaz
            </Text>
          </View>

          {/* Metin alanı */}
          <Input
            label="Talebelerin listesi"
            placeholder={'Ali Veli\nFatma Yılmaz\n...'}
            value={rawText}
            onChangeText={setRawText}
            multiline
            numberOfLines={8}
          />

          {/* Önizleme */}
          {parsedLines.some((l) => l.raw.trim()) && (
            <View>
              <Text variant="label" style={{ marginBottom: spacing.sm }}>
                Önizleme ({validLines.length}/{parsedLines.filter((l) => l.raw.trim()).length} geçerli)
              </Text>
              {withDuplicates.map((line) => (
                <View
                  key={line.index}
                  style={[
                    styles.previewRow,
                    {
                      backgroundColor: line.isDuplicate
                        ? colors.warningSoft
                        : colors.successSoft,
                      borderRadius: radius.md,
                      paddingHorizontal: spacing.base,
                      paddingVertical: spacing.sm,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  <Text variant="body" color={line.isDuplicate ? colors.warning : colors.success}>
                    {line.isDuplicate ? '⚠️ ' : '✓ '}
                    {line.firstName} {line.lastName}
                    {line.isDuplicate ? ' (zaten var)' : ''}
                  </Text>
                </View>
              ))}
              {invalidLines.map((line) => (
                <View
                  key={line.index}
                  style={[
                    styles.previewRow,
                    {
                      backgroundColor: colors.dangerSoft,
                      borderRadius: radius.md,
                      paddingHorizontal: spacing.base,
                      paddingVertical: spacing.sm,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  <Text variant="caption" color={colors.danger}>
                    ✕ &quot;{line.raw}&quot; — {line.error}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Ekle butonu */}
          <Button
            label={
              bulkCreate.isPending
                ? tr.common.saving
                : `Hepsini Ekle (${withDuplicates.filter((l) => !l.isDuplicate).length})`
            }
            onPress={handleAdd}
            disabled={!canSubmit || bulkCreate.isPending}
            fullWidth
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  infoBox: {},
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
