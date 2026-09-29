/**
 * src/components/ui/StatCard.tsx
 * Tekil metrik kartı — değer, etiket, ikon veya emoji.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Card } from './Card';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: IoniconsName;
  emoji?: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  emoji,
  color,
  trend,
  trendLabel,
}: StatCardProps) {
  const { colors, spacing, fontFamily, fontSize } = useTheme();

  const trendColor =
    trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.muted;

  const trendIcon: IoniconsName =
    trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove';

  return (
    <Card shadow="sm" style={{ flex: 1 }}>
      <View style={styles.row}>
        {emoji ? (
          <Text style={{ fontSize: 28, marginRight: spacing.sm }}>{emoji}</Text>
        ) : icon ? (
          <View
            style={[
              styles.iconBg,
              { backgroundColor: (color ?? colors.primary) + '20', marginRight: spacing.sm },
            ]}
          >
            <Ionicons name={icon} size={22} color={color ?? colors.primary} />
          </View>
        ) : null}

        <View style={{ flex: 1 }}>
          <Text variant="caption" color={colors.muted}>
            {label}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
            <Text
              style={{
                fontFamily: fontFamily.extraBold,
                fontSize: fontSize.xxl,
                color: color ?? colors.ink,
                lineHeight: fontSize.xxl * 1.1,
              }}
            >
              {value}
            </Text>
            {unit ? (
              <Text
                variant="caption"
                color={colors.muted}
                style={{ marginLeft: spacing.xs }}
              >
                {unit}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {trend && trendLabel ? (
        <View style={[styles.trend, { marginTop: spacing.sm }]}>
          <Ionicons name={trendIcon} size={14} color={trendColor} />
          <Text variant="label" color={trendColor} style={{ marginLeft: 4 }}>
            {trendLabel}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
