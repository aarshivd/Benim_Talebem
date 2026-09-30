/**
 * app/(tabs)/rankings.tsx
 * Sıralama ve Ödüller.
 */

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Screen, Text, Button, Segmented, Avatar, EmptyState, Badge, IconButton } from '@/components/ui';
import { Podium } from '@/components/ui/Podium';
import { useRanking } from '@/features/ranking/hooks';
import { useGroups } from '@/features/groups/hooks';
import { useTerms, useActiveTerm } from '@/features/terms/hooks';
import { todayLocal } from '@/domain';
import { GroupPalette } from '@/theme/tokens';
import tr from '@/i18n/tr';

export default function RankingsScreen() {
  const { colors, spacing, radius, shadows } = useTheme();
  const router = useRouter();

  const [scope, setScope] = useState<'daily' | 'term'>('daily');
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  const [day, setDay] = useState(todayLocal());

  const { data: groups = [] } = useGroups();
  const activeGroups = groups.filter(g => !g.isArchived && !g.deletedAt);

  const { data: terms = [] } = useTerms();
  const { data: activeTerm } = useActiveTerm();
  const [selectedTermId, setSelectedTermId] = useState<string | undefined>(activeTerm?.id ?? terms[0]?.id);

  // Fallback to update selectedTermId when activeTerm loads
  React.useEffect(() => {
    if (!selectedTermId && activeTerm) setSelectedTermId(activeTerm.id);
  }, [activeTerm, selectedTermId]);

  const rankingOptions = {
    scope,
    day: scope === 'daily' ? day : undefined,
    termId: scope === 'term' ? selectedTermId : undefined,
    groupId: selectedGroupId,
  };

  const { data: rankingData, isLoading } = useRanking(rankingOptions);

  const rankedRows = rankingData?.rankedRows ?? [];
  const earnedRewards = rankingData?.earnedRewards ?? {};
  const allRewards = rankingData?.allRewards ?? [];

  // Gün gezgini fonksiyonları
  const handlePrevDay = () => {
    const d = new Date(day);
    d.setDate(d.getDate() - 1);
    setDay(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  const handleNextDay = () => {
    if (day >= todayLocal()) return;
    const d = new Date(day);
    d.setDate(d.getDate() + 1);
    setDay(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  // Podium (ilk 3)
  const top3 = [
    rankedRows.find(r => r.rank === 1) ?? null,
    rankedRows.find(r => r.rank === 2) ?? null,
    rankedRows.find(r => r.rank === 3) ?? null,
  ];

  // Liste (4. ve sonrası, sıfır puanlılar dahil)
  const restRows = rankedRows.filter(r => r.rank === null || r.rank > 3);

  // Ödül şeridi verileri
  const hasRewards = scope === 'term' && allRewards.length > 0;
  // Sadece aktif dönemde o kapsama ait ödülleri filtrele
  const scopeRewards = allRewards.filter(r => r.scope === scope);
  const totalEarners = Object.values(earnedRewards).filter(arr => arr.length > 0).length;

  const renderItem = ({ item }: { item: typeof restRows[0] }) => {
    const isZero = item.points <= 0;
    const group = groups.find(g => g.id === item.groupId);
    const colorItem = GroupPalette[group?.color ?? 0] ?? GroupPalette[0];
    const studentRewards = earnedRewards[item.studentId] ?? [];

    return (
      <Pressable
        onPress={() => router.push(`/student/${item.studentId}`)}
        style={[
          styles.row,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.base,
            marginBottom: spacing.sm,
            opacity: isZero ? 0.6 : 1,
            ...shadows.sm,
          }
        ]}
      >
        <View style={{ width: 30, alignItems: 'center', marginRight: spacing.sm }}>
          <Text variant="bodySemi" color={colors.muted}>{item.rank ?? '—'}</Text>
        </View>
        <Avatar name={item.name} emoji={item.avatar ?? undefined} size="sm" color={colorItem.bg} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text variant="bodySemi" color={colors.ink}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {group && <Text variant="caption" color={colors.muted}>{group.emoji} {group.name}</Text>}
            {studentRewards.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {studentRewards.map(rid => {
                  const r = allRewards.find(x => x.id === rid);
                  return <Text key={rid} style={{ fontSize: 12 }}>{r?.icon ?? '🏆'}</Text>;
                })}
              </View>
            )}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="bodySemi" color={colors.primary}>{item.points} p</Text>
          <Text variant="caption" color={colors.muted}>{item.pages} sayfa</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <Screen title="Sıralama">
      <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.sm }}>
        <Segmented
          options={[
            { label: 'Günlük', value: 'daily' },
            { label: 'Dönemlik', value: 'term' },
          ]}
          selected={scope}
          onSelect={(s) => setScope(s as 'daily' | 'term')}
        />
      </View>

      {/* Grup Filtresi */}
      <View style={{ paddingBottom: spacing.sm }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.base }}>
          <Pressable
            onPress={() => setSelectedGroupId(undefined)}
            style={[styles.filterChip, {
              backgroundColor: !selectedGroupId ? colors.primary : colors.surface,
              borderColor: !selectedGroupId ? colors.primary : colors.border,
              borderRadius: radius.full,
            }]}
          >
            <Text variant="captionSemi" color={!selectedGroupId ? colors.white : colors.ink}>Tümü</Text>
          </Pressable>
          {activeGroups.map(g => (
            <Pressable
              key={g.id}
              onPress={() => setSelectedGroupId(g.id)}
              style={[styles.filterChip, {
                backgroundColor: selectedGroupId === g.id ? colors.primary : colors.surface,
                borderColor: selectedGroupId === g.id ? colors.primary : colors.border,
                borderRadius: radius.full,
              }]}
            >
              <Text variant="captionSemi" color={selectedGroupId === g.id ? colors.white : colors.ink}>{g.emoji} {g.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Zaman Gezgini / Dönem Seçici */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm }}>
        {scope === 'daily' ? (
          <>
            <IconButton icon="chevron-back" onPress={handlePrevDay} color={colors.ink} accessibilityLabel="Önceki gün" />
            <Text variant="bodySemi" color={colors.ink} style={{ marginHorizontal: spacing.md }}>
              {day === todayLocal() ? 'Bugün' : day}
            </Text>
            <IconButton icon="chevron-forward" onPress={handleNextDay} disabled={day >= todayLocal()} color={day >= todayLocal() ? colors.border : colors.ink} accessibilityLabel="Sonraki gün" />
          </>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {terms.length === 0 ? (
              <Button label="Dönem Oluştur" variant="secondary" size="sm" onPress={() => router.push('/settings/terms' as any)} />
            ) : (
              // Basit bir dropdown yerine şimdilik sadece aktif dönemi gösteriyoruz, diğer dönemleri seçmek için settings'e gidilir veya picker eklenir.
              // Şimdilik sadece seçili dönemin adını gösterip, değiştirmek için modal/picker yapabiliriz.
              // Çok karmaşıklaştırmamak için şimdilik tıklanınca eylem yok, sadece metin gösterelim.
              <Text variant="bodySemi" color={colors.ink}>
                {terms.find(t => t.id === selectedTermId)?.name ?? 'Dönem Seçili Değil'}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Ödül Şeridi */}
      {hasRewards && scopeRewards.length > 0 && (
        <View style={{ backgroundColor: colors.sunSoft, padding: spacing.sm, paddingHorizontal: spacing.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="captionSemi" color={colors.ink}>🏆 {scopeRewards.length} Ödül Hedefi</Text>
          <Text variant="caption" color={colors.muted}>{totalEarners} talebe kazandı</Text>
        </View>
      )}

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Yükleniyor...</Text></View>
      ) : rankedRows.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState emoji="📊" title="Henüz puan yok." description="Sıralama oluşturmak için talebelere puan veya okuma ekleyin." />
          <View style={{ alignItems: 'center', marginTop: spacing.md }}>
            <Button label="İlk puanı ver" variant="primary" size="sm" onPress={() => router.push('/(tabs)/groups')} />
          </View>
        </View>
      ) : (
        <FlatList
          data={restRows}
          keyExtractor={(item) => item.studentId}
          renderItem={renderItem}
          ListHeaderComponent={
            // Sadece ilk 3 varsa podyumu göster
            top3.some(x => x !== null) ? (
              <View style={{ marginTop: spacing.md, marginBottom: spacing.xl }}>
                <Podium top3={top3} onPress={(id) => router.push(`/student/${id}`)} />
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: 100 }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterChip: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
