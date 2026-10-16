/**
 * app/board.tsx
 * Pano Modu (Salt Okunur)
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, BackHandler, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useTheme } from '@/theme';
import { Text, Avatar, Segmented, IconButton, SwitchRow, PinPad } from '@/components/ui';
import { Podium } from '@/components/ui/Podium';
import { useRanking } from '@/features/ranking/hooks';
import { useGroups } from '@/features/groups/hooks';
import { useActiveTerm } from '@/features/terms/hooks';
import { todayLocal } from '@/domain';
import { verifyPin } from '@/lib/pin';
import { GroupPalette } from '@/theme/tokens';
import tr from '@/i18n/tr';

export default function BoardScreen() {
  useKeepAwake();
  const { colors, spacing, radius, shadows } = useTheme();
  const router = useRouter();

  const [scope, setScope] = useState<'daily' | 'term'>('daily');
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showExitPin, setShowExitPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinInput, setPinInput] = useState('');

  const { data: groups = [] } = useGroups();
  const activeGroups = groups.filter((g) => !g.isArchived && !g.deletedAt);
  const { data: activeTerm } = useActiveTerm();

  // Auto-rotate logic
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setScope((prev) => (prev === 'daily' ? 'term' : 'daily'));
    }, 10000); // 10 saniye
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Back handler
  useEffect(() => {
    const onBackPress = () => {
      setShowExitPin(true);
      setPinInput('');
      setPinError('');
      return true; // prevent default behavior
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  const rankingOptions = {
    scope,
    day: scope === 'daily' ? todayLocal() : undefined,
    termId: scope === 'term' ? activeTerm?.id : undefined,
    groupId: selectedGroupId,
  };

  const { data: rankingData } = useRanking(rankingOptions);
  const rankedRows = rankingData?.rankedRows ?? [];
  const earnedRewards = rankingData?.earnedRewards ?? {};
  const allRewards = rankingData?.allRewards ?? [];

  const top3 = [
    rankedRows.find((r) => r.rank === 1) ?? null,
    rankedRows.find((r) => r.rank === 2) ?? null,
    rankedRows.find((r) => r.rank === 3) ?? null,
  ];

  const restRows = rankedRows.filter((r) => r.rank === null || r.rank > 3);

  const handlePinPress = (key: string) => {
    if (pinInput.length < 6) {
      setPinInput((prev) => prev + key);
      setPinError('');
    }
  };

  const handlePinDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setPinError('');
  };

  useEffect(() => {
    if (pinInput.length >= 4) {
      // PinPad uses 4-6 pins. Wait, usually it auto-submits at 6 or there is a confirm button.
      // But verifyPin is async and can be checked. We'll check every time length >= 4, if error, we don't clear until it hits 6 maybe?
      // Better to check automatically when length is 4-6. Let's just provide a simple submit button or auto check when length = 4 if all pins are 4?
      // It's better to verify and if correct, exit. If length reaches 6 and still wrong, show error.
      const checkPin = async () => {
        try {
          const isValid = await verifyPin(pinInput);
          if (isValid) {
            setShowExitPin(false);
            router.back();
          } else if (pinInput.length === 6) {
            setPinError('Hatalı PIN');
            setPinInput('');
          }
        } catch (e: any) {
          setPinError(e.message);
          setPinInput('');
        }
      };
      checkPin();
    }
  }, [pinInput, router]);

  const renderItem = ({ item }: { item: (typeof restRows)[0] }) => {
    const isZero = item.points <= 0;
    const group = groups.find((g) => g.id === item.groupId);
    const colorItem = GroupPalette[group?.color ?? 0] ?? GroupPalette[0];
    const studentRewards = earnedRewards[item.studentId] ?? [];

    return (
      <View
        style={[
          styles.row,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.base,
            marginBottom: spacing.sm,
            opacity: isZero ? 0.6 : 1,
            ...shadows.sm,
          },
        ]}
      >
        <View style={{ width: 40, alignItems: 'center', marginRight: spacing.sm }}>
          <Text variant="heading" color={colors.muted}>
            {item.rank ?? '—'}
          </Text>
        </View>
        <Avatar name={item.name} emoji={item.avatar ?? undefined} size="md" color={colorItem.bg} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text variant="heading" color={colors.ink}>
            {item.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {group && (
              <Text variant="body" color={colors.muted}>
                {group.emoji} {group.name}
              </Text>
            )}
            {studentRewards.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {studentRewards.map((rid) => {
                  const r = allRewards.find((x) => x.id === rid);
                  return (
                    <Text key={rid} style={{ fontSize: 16 }}>
                      {r?.icon ?? '🏆'}
                    </Text>
                  );
                })}
              </View>
            )}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="heading" color={colors.primary}>
            {item.points} p
          </Text>
          <Text variant="bodySemi" color={colors.muted}>
            {item.pages} sayfa
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: 40 }}>
      {/* Top Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.base,
          marginBottom: spacing.md,
        }}
      >
        <IconButton
          icon="lock-closed"
          onPress={() => {
            setPinInput('');
            setPinError('');
            setShowExitPin(true);
          }}
          color={colors.ink}
          accessibilityLabel="Çıkış (PIN ile)"
        />

        <View style={{ width: 200 }}>
          <Segmented
            options={[
              { label: 'Günlük', value: 'daily' },
              { label: 'Dönemlik', value: 'term' },
            ]}
            selected={scope}
            onSelect={(s) => {
              setScope(s as 'daily' | 'term');
              setAutoRotate(false);
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text variant="captionSemi" color={colors.muted} style={{ marginRight: 8 }}>
            Oto Döngü
          </Text>
          <SwitchRow label="" value={autoRotate} onValueChange={setAutoRotate} />
        </View>
      </View>

      <FlatList
        data={restRows}
        keyExtractor={(item) => item.studentId}
        renderItem={renderItem}
        ListHeaderComponent={
          top3.some((x) => x !== null) ? (
            <View style={{ marginVertical: spacing.xl }}>
              <Podium top3={top3} onPress={() => {}} />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 100 }}
      />

      <Modal visible={showExitPin} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              padding: spacing.xl,
              borderRadius: radius.xl,
              alignItems: 'center',
            }}
          >
            <Text variant="heading" color={colors.ink} style={{ marginBottom: spacing.sm }}>
              Pano Modundan Çık
            </Text>
            <Text
              variant="body"
              color={colors.muted}
              style={{ marginBottom: spacing.xl, textAlign: 'center' }}
            >
              Çıkmak için hocanın PIN kodu gereklidir. Ekranda okuma verileri değiştirilemez.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: spacing.xl }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pinDot,
                    { backgroundColor: i < pinInput.length ? colors.primary : colors.border },
                  ]}
                />
              ))}
            </View>

            {!!pinError && (
              <Text variant="caption" color={colors.danger} style={{ marginBottom: spacing.md }}>
                {pinError}
              </Text>
            )}

            <PinPad onKeyPress={handlePinPress} onDelete={handlePinDelete} />

            <View style={{ marginTop: spacing.xl }}>
              <Pressable onPress={() => setShowExitPin(false)}>
                <Text variant="bodySemi" color={colors.primary}>
                  İptal
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
