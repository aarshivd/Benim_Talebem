import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Button, ListItem } from '@/components/ui';
import { useTheme } from '@/theme';
import { verifyDataIntegrity, IntegrityIssue } from '@/lib/integrity';

export default function DevIntegrityScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const [issues, setIssues] = useState<IntegrityIssue[] | null>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    const result = await verifyDataIntegrity();
    setIssues(result);
    setLoading(false);
  };

  return (
    <Screen title="Veri Bütünlüğü" showBack scroll>
      <View style={{ marginBottom: spacing.lg }}>
        <Text variant="body" color={colors.muted} style={{ marginBottom: spacing.md }}>
          Bu araç, veritabanındaki kayıtları tarar ve yetim kalmış ilişkiler veya mimari ihlaller
          olup olmadığını kontrol eder.
        </Text>
        <Button
          label={loading ? 'Taranıyor...' : 'Taramayı Başlat'}
          onPress={runCheck}
          disabled={loading}
          variant="primary"
        />
      </View>

      {issues !== null && (
        <View>
          <Text variant="heading" color={colors.ink} style={{ marginBottom: spacing.md }}>
            Sonuçlar
          </Text>

          {issues.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.successSoft,
                padding: spacing.md,
                borderRadius: radius.md,
              }}
            >
              <Text variant="bodySemi" color={colors.success}>
                Mükemmel! Hiçbir veri bütünlüğü sorunu bulunmadı.
              </Text>
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {issues.map((issue, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor:
                      issue.type === 'error' ? colors.dangerSoft : colors.warningSoft,
                    padding: spacing.md,
                    borderRadius: radius.md,
                  }}
                >
                  <Text
                    variant="captionSemi"
                    color={issue.type === 'error' ? colors.danger : colors.warning}
                  >
                    {issue.type === 'error' ? 'Hata' : 'Uyarı'} - {issue.count} Kayıt
                  </Text>
                  <Text variant="body" color={colors.ink} style={{ marginTop: 4 }}>
                    {issue.message}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}
