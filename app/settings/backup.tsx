/**
 * app/settings/backup.tsx
 * Yedekleme ve geri yükleme ekranı
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { useTheme } from '@/theme';
import { Screen, Text, Button, Segmented, PinPad, ListItem } from '@/components/ui';
import { useSettings, useUpdateSettings } from '@/features/settings/hooks';
import { createBackup, validateBackup, restoreBackup, clearAllData } from '@/lib/backup';
import { verifyPin } from '@/lib/pin';
import { nowIso } from '@/lib/time';

export default function BackupScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [localReminderDays, setLocalReminderDays] = useState<string | null>(null);
  const reminderDays = localReminderDays ?? String(settings?.backup_reminder_days ?? 14);

  const [pinVisible, setPinVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBackup = async () => {
    try {
      setIsProcessing(true);
      const appVersion = Constants.expoConfig?.version ?? '1.0.0';
      const backupData = await createBackup(appVersion);
      const jsonString = JSON.stringify(backupData, null, 2);

      const fileName = `okuma-yildizi-yedek-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Yedeği Paylaş',
        });

        // Yedekleme başarılı sayıldığında tarihi güncelle
        await updateSettings.mutateAsync({ last_backup_at: nowIso() });
      } else {
        Alert.alert('Hata', 'Paylaşım bu cihazda desteklenmiyor.');
      }
    } catch (e: any) {
      Alert.alert('Hata', `Yedekleme sırasında bir hata oluştu: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || result.assets.length === 0) return;

      setIsProcessing(true);
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      let json;
      try {
        json = JSON.parse(fileContent);
      } catch (e) {
        throw new Error('Geçersiz JSON dosyası.');
      }

      const { ok, data, error } = validateBackup(json);
      if (!ok || !data) {
        throw new Error(error ?? 'Yedek dosyası doğrulanamadı.');
      }

      // Önizleme
      const groupsCount = data.data.groups?.length ?? 0;
      const studentsCount = data.data.students?.length ?? 0;
      const readingLogsCount = data.data.readingLogs?.length ?? 0;
      const pointEventsCount = data.data.pointEvents?.length ?? 0;

      Alert.alert(
        'Yedekten Geri Yükle',
        `Tarih: ${data.exportedAt.split('T')[0]}\n\nBu yedek ${groupsCount} grup, ${studentsCount} talebe, ${readingLogsCount} okuma kaydı ve ${pointEventsCount} puan kaydı içeriyor.\n\nMEVCUT TÜM VERİ SİLİNECEK. Devam etmek istiyor musunuz?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Geri Yükle',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsProcessing(true);
                await restoreBackup(data);
                await queryClient.invalidateQueries();
                Alert.alert('Başarılı', 'Yedek başarıyla geri yüklendi.', [
                  { text: 'Tamam', onPress: () => router.replace('/(tabs)') },
                ]);
              } catch (e: any) {
                Alert.alert('Hata', `Geri yükleme başarısız: ${e.message}`);
              } finally {
                setIsProcessing(false);
              }
            },
          },
        ],
      );
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAllConfirm = async () => {
    if (pinInput.length < 4) {
      setPinError('PIN eksik.');
      return;
    }
    try {
      const isValid = await verifyPin(pinInput);
      if (!isValid) {
        setPinError('PIN hatalı.');
        setPinInput('');
        return;
      }

      setPinVisible(false);
      setPinInput('');

      Alert.alert('SON UYARI', 'TÜM VERİLER SİLİNECEK. Bu işlem geri alınamaz!', [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hepsini Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await clearAllData();
              await queryClient.invalidateQueries();
              Alert.alert('Başarılı', 'Tüm veriler temizlendi.', [
                { text: 'Tamam', onPress: () => router.replace('/(tabs)') },
              ]);
            } catch (e: any) {
              Alert.alert('Hata', `Veriler silinemedi: ${e.message}`);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]);
    } catch (e: any) {
      setPinError(e.message);
      setPinInput('');
    }
  };

  if (isLoading)
    return (
      <Screen title="Yedekleme">
        <Text>Yükleniyor...</Text>
      </Screen>
    );

  return (
    <Screen title="Yedekleme" showBack scroll>
      <ScrollView
        contentContainerStyle={{ padding: spacing.base, gap: spacing.xl, paddingBottom: 60 }}
      >
        {/* Durum */}
        <View
          style={{
            backgroundColor: colors.surface,
            padding: spacing.md,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text variant="captionSemi" color={colors.muted}>
            Son Yedekleme
          </Text>
          <Text variant="bodySemi" color={colors.ink} style={{ marginTop: 4 }}>
            {settings?.last_backup_at
              ? new Date(settings.last_backup_at).toLocaleString('tr-TR')
              : 'Hiç yedek alınmadı'}
          </Text>
        </View>

        {/* Uyarı */}
        <View
          style={{
            backgroundColor: colors.warningSoft,
            padding: spacing.md,
            borderRadius: radius.lg,
          }}
        >
          <Text variant="captionSemi" color={colors.ink}>
            ⚠️ Önemli Uyarı
          </Text>
          <Text variant="caption" color={colors.ink} style={{ marginTop: 4 }}>
            Yedek dosyası şifrelenmez ve talebe isimlerini içerir. Dosyayı güvenmediğiniz kişilerle
            veya ortamlarda paylaşmayın.
          </Text>
        </View>

        {/* Aksiyonlar */}
        <View style={{ gap: spacing.md }}>
          <Button
            label="Yedek Al ve Paylaş"
            variant="primary"
            onPress={handleBackup}
            disabled={isProcessing}
          />
          <Button
            label="Yedekten Geri Yükle"
            variant="secondary"
            onPress={handleRestore}
            disabled={isProcessing}
          />
        </View>

        {/* Hatırlatma Ayarı */}
        <View>
          <Text variant="label" color={colors.muted} style={{ marginBottom: spacing.xs }}>
            Yedekleme Hatırlatıcısı
          </Text>
          <Segmented
            options={[
              { label: '7 Gün', value: '7' },
              { label: '14 Gün', value: '14' },
              { label: '30 Gün', value: '30' },
            ]}
            selected={reminderDays}
            onSelect={(val) => {
              setLocalReminderDays(val);
              updateSettings.mutate({ backup_reminder_days: Number(val) });
            }}
          />
        </View>

        {/* Tehlikeli Bölge */}
        <View
          style={{
            marginTop: spacing.xl,
            paddingTop: spacing.xl,
            borderTopWidth: 1,
            borderTopColor: colors.danger,
          }}
        >
          <Text variant="heading" color={colors.danger} style={{ marginBottom: spacing.md }}>
            Tehlikeli Bölge
          </Text>
          <Text variant="caption" color={colors.muted} style={{ marginBottom: spacing.md }}>
            Bu cihazdaki tüm öğrenci, okuma, puan ve dönem kayıtlarını kalıcı olarak siler.
          </Text>
          <Button
            label="Tüm Verileri Sil"
            variant="danger"
            onPress={() => {
              setPinInput('');
              setPinError('');
              setPinVisible(true);
            }}
            disabled={isProcessing}
          />
        </View>
      </ScrollView>

      {/* PIN Doğrulama Modalı */}
      <Modal visible={pinVisible} transparent animationType="fade">
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
            <Text variant="heading" color={colors.ink} style={{ marginBottom: spacing.md }}>
              Yetki Onayı
            </Text>
            <Text
              variant="caption"
              color={colors.muted}
              style={{ marginBottom: spacing.lg, textAlign: 'center' }}
            >
              Verileri silmek için PIN kodunuzu girin.
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

            <PinPad
              onKeyPress={(key) => {
                if (pinInput.length < 6) {
                  setPinInput((p) => p + key);
                  setPinError('');
                }
              }}
              onDelete={() => {
                setPinInput((p) => p.slice(0, -1));
                setPinError('');
              }}
            />

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
              <Button
                label="İptal"
                variant="secondary"
                onPress={() => setPinVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                label="Onayla"
                variant="danger"
                onPress={handleClearAllConfirm}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
