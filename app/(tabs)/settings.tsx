/**
 * app/(tabs)/settings.tsx
 * Ayarlar menüsü.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text, Screen, ListItem, SectionHeader } from '@/components/ui';

export default function SettingsScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();

  return (
    <Screen title="Ayarlar" scroll>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <SectionHeader title="Ödül ve Puan" />
        <View style={styles.section}>
          <ListItem
            title="Puan ve Okuma"
            subtitle="Sayfa-puan oranı ve hedefler"
            leftSlot={<Ionicons name="book-outline" size={24} color={colors.primary} />}
            onPress={() => router.push('/settings/points-config')}
          />
          <ListItem
            title="Puan Kuralları"
            subtitle="Hızlı puan butonları"
            leftSlot={<Ionicons name="star-outline" size={24} color={colors.primary} />}
            onPress={() => router.push('/settings/point-rules')}
          />
          <ListItem
            title="Ödüller"
            subtitle="Günlük ve dönemlik ödül hedefleri"
            leftSlot={<Ionicons name="trophy-outline" size={24} color={colors.primary} />}
            onPress={() => router.push('/settings/rewards')}
          />
        </View>

        <SectionHeader title="Sistem" />
        <View style={styles.section}>
          <ListItem
            title="Dönemler"
            subtitle="Okul dönemleri ve tarihleri"
            leftSlot={<Ionicons name="calendar-outline" size={24} color={colors.primary} />}
            onPress={() => router.push('/settings/terms')}
          />
          <ListItem
            title="Güvenlik"
            subtitle="PIN ve otomatik kilit"
            leftSlot={<Ionicons name="lock-closed-outline" size={24} color={colors.primary} />}
            onPress={() => router.push('/settings/security')}
          />
          <ListItem
            title="Yedekleme"
            subtitle="Verileri dışa/içe aktar"
            leftSlot={<Ionicons name="save-outline" size={24} color={colors.primary} />}
            onPress={() => {
              // Aşama 12
            }}
          />
        </View>

        <SectionHeader title="Hakkında" />
        <View style={styles.section}>
          <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
            <Text variant="captionSemi" color={colors.ink}>Sürüm 1.0.0</Text>
            <Text variant="caption" color={colors.muted} style={{ marginTop: 4 }}>
              Benim Talebem, talebelerin okuma ve puanlarını takip etmek için tasarlanmıştır. 
              Tüm veriler yalnızca bu cihazda tutulmaktadır.
            </Text>
          </View>
        </View>

        {__DEV__ && (
          <View style={{ marginTop: spacing.xl }}>
            <SectionHeader title="Geliştirici" />
            <View style={styles.section}>
              <ListItem
                title="Bileşen Galerisi"
                leftSlot={<Ionicons name="color-palette-outline" size={24} color={colors.primary} />}
                onPress={() => router.push('/__dev/components' as any)}
              />
              <ListItem
                title="DB Testleri"
                leftSlot={<Ionicons name="server-outline" size={24} color={colors.primary} />}
                onPress={() => router.push('/__dev/db' as any)}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EADFCF',
    marginBottom: 24,
  }
});
