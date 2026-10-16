/**
 * app/(tabs)/index.tsx
 * Hoca panosu (Bugün).
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import {
  Screen,
  Text,
  StatCard,
  Avatar,
  Badge,
  IconButton,
  OnboardingProgress,
} from '@/components/ui';
import { Podium } from '@/components/ui/Podium';
import { useRanking } from '@/features/ranking/hooks';
import { useActiveTerm } from '@/features/terms/hooks';
import { useSettings } from '@/features/settings/hooks';
import { useSession } from '@/store/session';
import { todayLocal, formatDayTr } from '@/domain';
import { GroupPalette } from '@/theme/tokens';
import tr from '@/i18n/tr';

export default function DashboardScreen() {
  const { colors, spacing, radius, shadows } = useTheme();
  const router = useRouter();
  const teacherName = useSession((s) => s.teacherName) ?? 'Hocam';

  const today = todayLocal();
  const { data: activeTerm } = useActiveTerm();
  const { data: rankingData, isLoading } = useRanking({ scope: 'daily', day: today });
  const { data: settings } = useSettings();

  const rankedRows = rankingData?.rankedRows ?? [];

  const stats = useMemo(() => {
    let readingCount = 0;
    let totalPages = 0;
    let totalPoints = 0;
    const notReadRows: typeof rankedRows = [];

    for (const row of rankedRows) {
      if (row.pages > 0) {
        readingCount++;
        totalPages += row.pages;
      } else {
        notReadRows.push(row);
      }
      totalPoints += row.points;
    }

    return {
      totalStudents: rankedRows.length,
      readingCount,
      totalPages,
      totalPoints,
      notReadRows,
    };
  }, [rankedRows]);

  const top3 = useMemo(
    () => [
      rankedRows.find((r) => r.rank === 1) ?? null,
      rankedRows.find((r) => r.rank === 2) ?? null,
      rankedRows.find((r) => r.rank === 3) ?? null,
    ],
    [rankedRows],
  );

  const [now] = React.useState(() => Date.now());

  const showBackupBanner = useMemo(() => {
    if (stats.totalStudents === 0 || !settings) return false;
    if (!settings.last_backup_at) return true;

    const lastBackup = new Date(settings.last_backup_at).getTime();
    const daysSinceBackup = (now - lastBackup) / (1000 * 60 * 60 * 24);

    return daysSinceBackup >= (settings.backup_reminder_days ?? 14);
  }, [stats.totalStudents, settings]);

  const renderHeader = () => (
    <View style={{ gap: spacing.lg, paddingBottom: spacing.md }}>
      {/* Selamlama & Tarih */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text variant="heading" color={colors.ink}>
            Merhaba, {teacherName}
          </Text>
          <Text variant="body" color={colors.muted} style={{ marginTop: 2 }}>
            {formatDayTr(today)}
          </Text>
        </View>
        {activeTerm && <Badge label={activeTerm.name} variant="primary" />}
      </View>

      <OnboardingProgress />

      {/* İstatistikler */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Okuyan"
            value={`${stats.readingCount} / ${stats.totalStudents}`}
            icon="book"
            color={colors.primary}
            animated
            delay={100}
          />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Sayfa"
            value={stats.totalPages}
            icon="layers"
            color={colors.success}
            animated
            delay={200}
          />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Puan"
            value={stats.totalPoints}
            icon="star"
            color={colors.warning}
            animated
            delay={300}
          />
        </View>
      </View>

      {/* Hızlı İşlemler */}
      <View>
        <Text variant="captionSemi" color={colors.muted} style={{ marginBottom: spacing.sm }}>
          Hızlı İşlemler
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Pressable style={styles.actionBtn} onPress={() => router.push('/reading/new')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primarySoft }]}>
              <Text style={{ fontSize: 24 }}>📖</Text>
            </View>
            <Text variant="captionSemi" color={colors.ink} align="center">
              Okuma Gir
            </Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => router.push('/reading/group')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.successSoft }]}>
              <Text style={{ fontSize: 24 }}>👥</Text>
            </View>
            <Text variant="captionSemi" color={colors.ink} align="center">
              Grup Okuma
            </Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => router.push('/(tabs)/groups')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warningSoft }]}>
              <Text style={{ fontSize: 24 }}>⭐</Text>
            </View>
            <Text variant="captionSemi" color={colors.ink} align="center">
              Puan Ver
            </Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => {
              Alert.alert(
                'Pano Modu',
                'Pano modundan çıkmak için hocanın PIN kodu gerekir. Başlatılsın mı?',
                [
                  { text: 'İptal', style: 'cancel' },
                  { text: 'Başlat', onPress: () => router.push('/board') },
                ],
              );
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.skySoft }]}>
              <Text style={{ fontSize: 24 }}>📺</Text>
            </View>
            <Text variant="captionSemi" color={colors.ink} align="center">
              Pano Modu
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Yedek Hatırlatma Alanı */}
      {showBackupBanner && (
        <Pressable
          onPress={() => router.push('/settings/backup')}
          style={{
            backgroundColor: colors.dangerSoft,
            padding: spacing.md,
            borderRadius: radius.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <Text variant="captionSemi" color={colors.danger}>
              Yedekleme Hatırlatması
            </Text>
            <Text variant="caption" color={colors.danger} style={{ marginTop: 2 }}>
              Verileriniz cihazınızda saklanıyor. Güvenlik için en kısa sürede bir yedek oluşturun.
            </Text>
          </View>
          <Text style={{ fontSize: 24 }}>💾</Text>
        </Pressable>
      )}

      {/* Bugünün Yıldızları */}
      {top3.some((x) => x !== null) && (
        <View>
          <Text variant="captionSemi" color={colors.muted} style={{ marginBottom: spacing.md }}>
            Bugünün Yıldızları
          </Text>
          <Podium top3={top3} onPress={(id) => router.push(`/student/${id}`)} />
        </View>
      )}

      {/* Liste Başlığı */}
      {stats.notReadRows.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <Text variant="captionSemi" color={colors.muted}>
            Okuması Girilmeyenler ({stats.notReadRows.length})
          </Text>
        </View>
      )}
    </View>
  );

  const renderItem = ({ item }: { item: (typeof rankedRows)[0] }) => {
    // Burada grup rengi elimizde yok, varsayılan atıyoruz ya da fetchleyebilirdik. Ancak rankedRows içinde groupId var, basitçe GroupPalette[0] kullansak yeterli ya da index mod vs.
    // Şimdilik Avatar colorItem olarak soft bir renk verelim.
    return (
      <Pressable
        onPress={() => router.push(`/reading/new?studentId=${item.studentId}`)}
        style={[
          styles.notReadRow,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.sm,
          },
        ]}
      >
        <Avatar
          name={item.name}
          emoji={item.avatar ?? undefined}
          size="sm"
          color={colors.surface}
        />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text variant="bodySemi" color={colors.ink}>
            {item.name}
          </Text>
        </View>
        <IconButton
          icon="book-outline"
          onPress={() => router.push(`/reading/new?studentId=${item.studentId}`)}
          color={colors.primary}
          accessibilityLabel="Okuma gir"
        />
      </Pressable>
    );
  };

  return (
    <Screen>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={stats.notReadRows}
          keyExtractor={(item) => item.studentId}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ padding: spacing.base, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionBtn: {
    flex: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  notReadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
