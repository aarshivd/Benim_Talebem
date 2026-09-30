/**
 * src/components/ui/Podium.tsx
 * İlk 3 sıralaması için (2-1-3 dizilimi).
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Avatar } from './Avatar';
import { Text } from './Text';
import type { RankedResult } from '@/domain/ranking';

export interface PodiumItem extends RankedResult {
  avatar: string | null;
  groupId: string;
}

interface PodiumProps {
  top3: (PodiumItem | null)[]; // [0] = 1st, [1] = 2nd, [2] = 3rd
  onPress: (studentId: string) => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const COLORS = ['#FDCB6E', '#DFE6E9', '#CD7F32']; // Altın, Gümüş, Bronz (Tema dışı sabit kalabilir veya temadan alınabilir)
const HEIGHTS = [120, 90, 70];

function PodiumColumn({ item, place, onPress, delay }: { item: PodiumItem | null; place: number; onPress: (id: string) => void; delay: number }) {
  const { colors, spacing, radius } = useTheme();
  
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    height.value = withDelay(delay, withSpring(HEIGHTS[place]));
    opacity.value = withDelay(delay, withSpring(1));
  }, [delay, place]); // eslint-disable-line react-hooks/exhaustive-deps

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  if (!item) {
    return (
      <View style={[styles.column, { justifyContent: 'flex-end' }]}>
         <View style={{ height: HEIGHTS[place], backgroundColor: colors.border, borderRadius: radius.md, opacity: 0.3 }} />
      </View>
    );
  }

  return (
    <Pressable style={[styles.column, { justifyContent: 'flex-end' }]} onPress={() => onPress(item.studentId)}>
      <View style={{ alignItems: 'center', marginBottom: spacing.sm }}>
        <Avatar name={item.name} emoji={item.avatar ?? undefined} size={place === 0 ? 'lg' : 'md'} color={colors.surface} />
        <View style={styles.medalBadge}>
          <Text style={{ fontSize: 16 }}>{MEDALS[place]}</Text>
        </View>
        <Text variant="captionSemi" color={colors.ink} numberOfLines={1} align="center" style={{ marginTop: 4, width: 80 }}>
          {item.name}
        </Text>
        <Text variant="captionSemi" color={colors.primary}>
          {item.points} p
        </Text>
      </View>
      <Animated.View
        style={[
          {
            backgroundColor: COLORS[place],
            borderTopLeftRadius: radius.md,
            borderTopRightRadius: radius.md,
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: spacing.sm,
          },
          animatedStyle,
        ]}
      >
        <Text variant="heading" style={{ color: 'rgba(0,0,0,0.3)' }}>{item.rank ?? place + 1}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function Podium({ top3, onPress }: PodiumProps) {
  // top3 is sorted [1st, 2nd, 3rd]
  const first = top3[0] ?? null;
  const second = top3[1] ?? null;
  const third = top3[2] ?? null;

  return (
    <View style={styles.container}>
      <PodiumColumn item={second} place={1} onPress={onPress} delay={100} />
      <PodiumColumn item={first} place={0} onPress={onPress} delay={0} />
      <PodiumColumn item={third} place={2} onPress={onPress} delay={200} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 220,
    gap: 8,
    paddingHorizontal: 16,
  },
  column: {
    flex: 1,
    maxWidth: 100,
  },
  medalBadge: {
    position: 'absolute',
    top: -8,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  }
});
