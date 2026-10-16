/**
 * app/points/give.tsx
 * Hızlı puan verme ekranı (modal).
 * ?studentIds=id1,id2
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Screen, Text, Button, Input, Avatar, Confetti } from '@/components/ui';
import { usePointRules, useGiveManualPoints } from '@/features/points/hooks';
import { useAllStudents } from '@/features/students/hooks';
import { todayLocal } from '@/domain';
import tr from '@/i18n/tr';

const CATEGORY_COLORS: Record<string, string> = {
  soru: 'primarySoft',
  davranis: 'successSoft',
  gorev: 'warningSoft',
  ozel: 'secondarySoft',
};

const CATEGORY_TEXT_COLORS: Record<string, string> = {
  soru: 'primary',
  davranis: 'success',
  gorev: 'warning',
  ozel: 'secondary',
};

export default function GivePointsScreen() {
  const router = useRouter();
  const { studentIds, groupId } = useLocalSearchParams<{ studentIds: string; groupId?: string }>();
  const ids = studentIds ? studentIds.split(',') : [];
  const { colors, spacing, radius, shadows } = useTheme();

  const { data: allStudents = [] } = useAllStudents();
  const selectedStudents = allStudents.filter((s) => ids.includes(s.id));

  const { data: rules = [] } = usePointRules();
  const activeRules = rules.filter((r) => r.isActive);

  const givePoints = useGiveManualPoints();

  const [date, setDate] = useState(todayLocal());
  const [note, setNote] = useState('');
  const [customPoints, setCustomPoints] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiCount, setConfettiCount] = useState(30);

  const triggerSuccess = (pts: number) => {
    if (pts > 0) {
      setConfettiCount(pts >= 10 ? 60 : 30);
      setShowConfetti(true);
    } else {
      router.back();
    }
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    router.back();
  };

  const handleGiveRule = async (ruleId: string, points: number, title: string) => {
    try {
      await givePoints.mutateAsync({
        studentIds: ids,
        ruleId,
        points,
        title,
        note: note.trim() || undefined,
        date,
      });
      triggerSuccess(points);
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  const handleGiveCustom = async () => {
    const pts = Number(customPoints);
    if (isNaN(pts) || pts === 0) {
      Alert.alert('Hata', 'Geçerli bir puan girin.');
      return;
    }
    if (!customTitle.trim()) {
      Alert.alert('Hata', 'Serbest puan için başlık girin.');
      return;
    }
    try {
      await givePoints.mutateAsync({
        studentIds: ids,
        points: pts,
        title: customTitle.trim(),
        note: note.trim() || undefined,
        date,
      });
      triggerSuccess(pts);
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  if (ids.length === 0) {
    return (
      <Screen title="Puan Ver" showBack>
        <Text>Talebe seçilmedi.</Text>
      </Screen>
    );
  }

  return (
    <Screen title="Puan Ver" showBack scroll>
      {/* Seçili Talebeler */}
      <View style={{ marginBottom: spacing.md }}>
        <Text variant="captionSemi" color={colors.muted} style={{ marginBottom: spacing.sm }}>
          Seçili Talebeler ({ids.length})
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm }}
        >
          {selectedStudents.map((s) => (
            <View key={s.id} style={{ alignItems: 'center', width: 64 }}>
              <Avatar
                name={`${s.firstName} ${s.lastName}`}
                emoji={s.avatar ?? undefined}
                size="md"
                color={colors.border}
              />
              <Text
                variant="caption"
                color={colors.ink}
                numberOfLines={1}
                align="center"
                style={{ marginTop: 4 }}
              >
                {s.firstName}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Tarih */}
      <View style={{ marginBottom: spacing.md }}>
        <Text variant="captionSemi" color={colors.muted} style={{ marginBottom: spacing.xs }}>
          Tarih (Y-A-G)
        </Text>
        <Input value={date} onChangeText={setDate} placeholder="2024-09-30" />
      </View>

      {/* Not */}
      <View style={{ marginBottom: spacing.lg }}>
        <Input placeholder="Not (isteğe bağlı)..." value={note} onChangeText={setNote} />
      </View>

      <Text variant="captionSemi" color={colors.muted} style={{ marginBottom: spacing.sm }}>
        Hızlı Kurallar
      </Text>

      {activeRules.length === 0 ? (
        <Text variant="body" color={colors.muted} style={{ marginBottom: spacing.lg }}>
          Aktif kural bulunmuyor.
        </Text>
      ) : (
        <View style={styles.grid}>
          {activeRules.map((rule) => {
            const bg =
              (colors as any)[CATEGORY_COLORS[rule.category] || 'surface'] || colors.surface;
            const fg = (colors as any)[CATEGORY_TEXT_COLORS[rule.category] || 'ink'] || colors.ink;
            return (
              <Pressable
                key={rule.id}
                onPress={() => handleGiveRule(rule.id, rule.points, rule.name)}
                style={[
                  styles.ruleBtn,
                  {
                    backgroundColor: bg,
                    borderRadius: radius.xl,
                    padding: spacing.md,
                    ...shadows.sm,
                  },
                ]}
              >
                <Text style={{ fontSize: 32, marginBottom: spacing.xs }}>{rule.icon}</Text>
                <Text
                  variant="captionSemi"
                  color={fg}
                  align="center"
                  numberOfLines={2}
                  style={{ height: 32 }}
                >
                  {rule.name}
                </Text>
                <Text variant="bodySemi" color={fg} style={{ marginTop: spacing.xs }}>
                  {rule.points > 0 ? `+${rule.points}` : rule.points}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text
        variant="captionSemi"
        color={colors.muted}
        style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}
      >
        Serbest Puan
      </Text>
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          alignItems: 'flex-start',
          paddingBottom: 60,
        }}
      >
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Puan..."
            keyboardType="numbers-and-punctuation"
            value={customPoints}
            onChangeText={setCustomPoints}
          />
        </View>
        <View style={{ flex: 2 }}>
          <Input
            placeholder="Başlık (ör. Ekstra Yardım)"
            value={customTitle}
            onChangeText={setCustomTitle}
          />
        </View>
        <Button label="Ver" onPress={handleGiveCustom} disabled={givePoints.isPending} />
      </View>
      <Confetti play={showConfetti} count={confettiCount} onComplete={handleConfettiComplete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ruleBtn: {
    width: '31%', // 3 in a row
    alignItems: 'center',
    justifyContent: 'center',
  },
});
