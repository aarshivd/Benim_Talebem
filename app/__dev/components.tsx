/**
 * app/__dev/components.tsx
 * Yalnızca __DEV__ ortamında erişilebilir bileşen galerisi.
 * Tüm bileşenlerin farklı durumları Türkçe metinlerle sergilenir.
 *
 * Türkçe karakter test satırı: ğ ü ş ı İ ö ç Ğ Ü Ş Ö Ç
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { AvatarEmojis, GroupEmojis } from '@/theme/tokens';
import {
  Text,
  Button,
  IconButton,
  Card,
  Input,
  TextArea,
  NumberStepper,
  ChipGroup,
  SwitchRow,
  Avatar,
  Badge,
  ProgressBar,
  ListItem,
  SectionHeader,
  EmptyState,
  FAB,
  Segmented,
  StatCard,
  Skeleton,
  SkeletonCard,
  BottomSheet,
  ConfirmDialog,
  Snackbar,
  EmojiPicker,
  ColorPicker,
} from '@/components/ui';
import tr from '@/i18n/tr';

// Galeri sadece DEV modunda görünür
if (!__DEV__) {
  throw new Error('Bileşen galerisi yalnızca geliştirme modunda erişilebilir.');
}

// ─── Yardımcı: Bölüm Başlığı ────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <View
        style={{
          backgroundColor: colors.primarySoft,
          paddingHorizontal: spacing.base,
          paddingVertical: spacing.xs,
          marginBottom: spacing.md,
          borderRadius: 8,
        }}
      >
        <Text
          variant="captionSemi"
          color={colors.primary}
          style={{ textTransform: 'uppercase', letterSpacing: 1 }}
        >
          {title}
        </Text>
      </View>
      <View style={{ paddingHorizontal: spacing.base, gap: spacing.md }}>{children}</View>
    </View>
  );
}

// ─── ANA GALERİ ─────────────────────────────────────────────────────────────

export default function ComponentGallery() {
  const { colors, spacing } = useTheme();

  // Durum değişkenleri
  const [inputVal, setInputVal] = useState('');
  const [textAreaVal, setTextAreaVal] = useState('');
  const [stepperVal, setStepperVal] = useState(10);
  const [chip1, setChip1] = useState('okul');
  const [chip2, setChip2] = useState<string[]>(['kitap', 'yıldız']);
  const [switchVal, setSwitchVal] = useState(true);
  const [segSelected, setSegSelected] = useState('günlük');
  const [colorIdx, setColorIdx] = useState(0);
  const [emojiSelected, setEmojiSelected] = useState('🐻');
  const [groupEmojiSel, setGroupEmojiSel] = useState('📚');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [groupEmojiPickerVisible, setGroupEmojiPickerVisible] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <View
        style={[
          styles.topBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text variant="heading" color={colors.primary}>
          🎨 Bileşen Galerisi
        </Text>
        <Text variant="caption" color={colors.muted}>
          ğ ü ş ı İ ö ç Ğ Ü Ş Ö Ç
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: spacing.base, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TİPOGRAFİ ─────────────────────────────────────────────── */}
        <Section title="Tipografi">
          <Text variant="display">Görüntü Başlık</Text>
          <Text variant="heading">Büyük Başlık</Text>
          <Text variant="title">Bölüm Başlığı</Text>
          <Text variant="bodySemi">Kalın Gövde Metni</Text>
          <Text variant="body">Normal gövde metni. Türkçe: ğüşıİöçĞÜŞÖÇ</Text>
          <Text variant="captionSemi">Açıklama Kalın</Text>
          <Text variant="caption" color={colors.muted}>
            Açıklama normal
          </Text>
          <Text variant="label" color={colors.muted}>
            KÜÇÜK ETİKET
          </Text>
        </Section>

        {/* ── DÜĞMELER ─────────────────────────────────────────────── */}
        <Section title="Düğmeler">
          <Button label="Birincil Düğme" variant="primary" onPress={() => {}} />
          <Button label="İkincil Düğme" variant="secondary" onPress={() => {}} />
          <Button label="Hayalet Düğme" variant="ghost" onPress={() => {}} />
          <Button label="Tehlikeli Düğme" variant="danger" onPress={() => {}} />
          <Button label="Küçük" variant="primary" size="sm" onPress={() => {}} />
          <Button label="Büyük" variant="primary" size="lg" onPress={() => {}} />
          <Button label="Devre Dışı" variant="primary" disabled onPress={() => {}} />
          <Button
            label={loadingBtn ? 'Yükleniyor…' : 'Yükleme Testi'}
            variant="primary"
            loading={loadingBtn}
            onPress={() => {
              setLoadingBtn(true);
              setTimeout(() => setLoadingBtn(false), 2000);
            }}
          />
        </Section>

        {/* ── İKON DÜĞMELERİ ───────────────────────────────────────── */}
        <Section title="İkon Düğmeleri">
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <IconButton icon="add-circle" onPress={() => {}} accessibilityLabel="Ekle" />
            <IconButton
              icon="trash"
              onPress={() => {}}
              accessibilityLabel="Sil"
              color={colors.danger}
            />
            <IconButton
              icon="pencil"
              onPress={() => {}}
              accessibilityLabel="Düzenle"
              color={colors.primary}
            />
            <IconButton icon="share-social" onPress={() => {}} accessibilityLabel="Paylaş" />
            <IconButton icon="settings" onPress={() => {}} accessibilityLabel="Ayarlar" disabled />
          </View>
        </Section>

        {/* ── KART ─────────────────────────────────────────────────── */}
        <Section title="Kart">
          <Card shadow="none">
            <Text variant="body">Gölgesiz kart</Text>
          </Card>
          <Card shadow="sm">
            <Text variant="body">Küçük gölge</Text>
          </Card>
          <Card shadow="md">
            <Text variant="body">Orta gölge</Text>
          </Card>
          <Card shadow="lg">
            <Text variant="body">Büyük gölge</Text>
          </Card>
        </Section>

        {/* ── GİRİŞ ALANLARI ───────────────────────────────────────── */}
        <Section title="Giriş Alanları">
          <Input
            label="Talebe Adı"
            placeholder="örn. Ahmet Kaya"
            value={inputVal}
            onChangeText={setInputVal}
            leftIcon="person"
            helperText="Ad ve soyadı giriniz"
          />
          <Input
            label="Kitap Adı"
            placeholder="Kitap adı"
            value=""
            onChangeText={() => {}}
            rightIcon="book"
          />
          <Input
            label="Hatalı Alan"
            placeholder="Zorunlu alan"
            value=""
            onChangeText={() => {}}
            error="Bu alan zorunludur."
          />
          <TextArea
            label="Notlar"
            placeholder="Ek açıklama yazın…"
            value={textAreaVal}
            onChangeText={setTextAreaVal}
            numberOfLines={4}
          />
        </Section>

        {/* ── SAYI GİRİCİ ──────────────────────────────────────────── */}
        <Section title="Sayı Girici">
          <NumberStepper
            label="Bugün okunan sayfa"
            value={stepperVal}
            onChange={setStepperVal}
            min={0}
            max={500}
          />
        </Section>

        {/* ── CHIP GRUBU ───────────────────────────────────────────── */}
        <Section title="Chip Grubu">
          <ChipGroup
            label="Kategori (tek seçim)"
            options={[
              { value: 'okul', label: 'Okul', emoji: '🏫' },
              { value: 'ödev', label: 'Ödev', emoji: '📝' },
              { value: 'kitap', label: 'Kitap', emoji: '📚' },
            ]}
            selected={chip1}
            onSelect={(v) => setChip1(v as string)}
          />
          <ChipGroup
            label="Etiket (çoklu seçim)"
            options={[
              { value: 'kitap', label: 'Kitap' },
              { value: 'yıldız', label: 'Yıldız' },
              { value: 'ödül', label: 'Ödül' },
              { value: 'başarı', label: 'Başarı' },
            ]}
            selected={chip2}
            onSelect={(v) => setChip2(v as string[])}
            multiple
            scrollable={false}
          />
        </Section>

        {/* ── ANAHTAR SATIRI ───────────────────────────────────────── */}
        <Section title="Anahtar Satırı">
          <SwitchRow
            label="Bildirimleri Etkinleştir"
            description="Günlük okuma hatırlatıcısı alın."
            value={switchVal}
            onValueChange={setSwitchVal}
          />
          <SwitchRow
            label="Eksi Puan İzni"
            description="Öğrenciler eksi puana düşebilir."
            value={false}
            onValueChange={() => {}}
            disabled
          />
        </Section>

        {/* ── AVATAR ───────────────────────────────────────────────── */}
        <Section title="Avatar">
          <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
            <Avatar name="Ahmet Kaya" emoji="🐻" size="sm" />
            <Avatar name="Ayşe Nur" emoji="🦊" size="md" />
            <Avatar name="Mehmet Yıldız" emoji="🌟" size="lg" />
            <Avatar name="Fatma Güler" emoji="🦁" size="xl" />
            <Avatar name="Ali Demir" size="md" forceStyle="initials" color={colors.primary} />
          </View>
        </Section>

        {/* ── ROZET ────────────────────────────────────────────────── */}
        <Section title="Rozet">
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.md,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Badge count={3} variant="primary" />
            <Badge count={12} variant="success" />
            <Badge count={99} variant="warning" />
            <Badge count={100} variant="danger" />
            <Badge label="YENİ" variant="primary" />
            <Badge dot variant="success" />
          </View>
        </Section>

        {/* ── İLERLEME ÇUBUĞU ─────────────────────────────────────── */}
        <Section title="İlerleme Çubuğu">
          <ProgressBar progress={0.25} label="Günlük hedef" showLabel />
          <ProgressBar progress={0.6} color={colors.success} showLabel />
          <ProgressBar progress={1} color={colors.sun} height={14} showLabel />
        </Section>

        {/* ── LİSTE SATIRI ─────────────────────────────────────────── */}
        <Section title="Liste Satırı">
          <Card padding={0} shadow="sm">
            <ListItem
              title="Ahmet Kaya"
              subtitle="42 sayfa · 15 puan"
              leftSlot={<Avatar name="Ahmet Kaya" emoji="🐻" size="sm" />}
              onPress={() => {}}
            />
            <ListItem
              title="Ayşe Nur Demir"
              subtitle="28 sayfa · 8 puan"
              leftSlot={<Avatar name="Ayşe Nur" emoji="🦊" size="sm" />}
              rightSlot={<Badge count={3} variant="primary" />}
              onPress={() => {}}
            />
            <ListItem
              title="Pasif Öğrenci"
              subtitle="Okuma kaydı yok"
              leftSlot={<Avatar name="Pasif" size="sm" forceStyle="initials" />}
              showDivider={false}
              disabled
            />
          </Card>
        </Section>

        {/* ── BÖLÜM BAŞLIĞI ────────────────────────────────────────── */}
        <Section title="Bölüm Başlığı">
          <SectionHeader title="Bugünkü Okumalar" actionLabel="Tümünü gör" onAction={() => {}} />
          <SectionHeader title="Sıralama" />
        </Section>

        {/* ── BOŞ DURUM ────────────────────────────────────────────── */}
        <Section title="Boş Durum">
          <EmptyState
            emoji="📭"
            title="Henüz talebe yok"
            description="İlk talebeyi eklemek için aşağıdaki düğmeye dokunun."
            actionLabel="Talebe Ekle"
            onAction={() => {}}
          />
        </Section>

        {/* ── SEGMENT ──────────────────────────────────────────────── */}
        <Section title="Segment Kontrolü">
          <Segmented
            options={[
              { value: 'günlük', label: 'Günlük' },
              { value: 'dönemlik', label: 'Dönemlik' },
            ]}
            selected={segSelected}
            onSelect={setSegSelected}
          />
        </Section>

        {/* ── İSTATİSTİK KART ──────────────────────────────────────── */}
        <Section title="İstatistik Kartı">
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <StatCard
              label="Toplam Puan"
              value={247}
              unit="puan"
              emoji="⭐"
              trend="up"
              trendLabel="Dünden +12"
            />
            <StatCard
              label="Sayfa"
              value={1840}
              unit="sayfa"
              icon="book"
              color={colors.mint}
              trend="neutral"
              trendLabel="Değişmedi"
            />
          </View>
        </Section>

        {/* ── İSKELET ──────────────────────────────────────────────── */}
        <Section title="İskelet (Yükleniyor)">
          <Skeleton height={20} width="70%" />
          <Skeleton height={14} />
          <SkeletonCard />
        </Section>

        {/* ── RENK SEÇİCİ ──────────────────────────────────────────── */}
        <Section title="Renk Seçici">
          <ColorPicker label="Grup rengi" selected={colorIdx} onSelect={setColorIdx} />
        </Section>

        {/* ── EMOJİ SEÇİCİ ─────────────────────────────────────────── */}
        <Section title="Emoji Seçici">
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <Text style={{ fontSize: 40 }}>{emojiSelected}</Text>
            <Button
              label="Avatar Emoji Seç"
              variant="secondary"
              size="sm"
              onPress={() => setEmojiPickerVisible(true)}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <Text style={{ fontSize: 40 }}>{groupEmojiSel}</Text>
            <Button
              label="Grup Emoji Seç"
              variant="secondary"
              size="sm"
              onPress={() => setGroupEmojiPickerVisible(true)}
            />
          </View>
        </Section>

        {/* ── MODAL & DIALOG ────────────────────────────────────────── */}
        <Section title="Modal ve Diyalog">
          <Button label="Alt Sayfa Aç" variant="primary" onPress={() => setSheetVisible(true)} />
          <Button
            label="Onay Diyaloğu Aç"
            variant="danger"
            onPress={() => setDialogVisible(true)}
          />
          <Button
            label={`Snackbar Göster (${tr.snackbar.saved})`}
            variant="secondary"
            onPress={() => setSnackVisible(true)}
          />
        </Section>
      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────────────── */}
      <FAB icon="add" onPress={() => setSheetVisible(true)} accessibilityLabel="Yeni kayıt ekle" />

      {/* ── MODALLER ─────────────────────────────────────────────── */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Alt Sayfa Örneği"
      >
        <Text variant="body">
          {'Bu bir alt sayfa örneğidir. Kapatmak için yukarı kaydırın veya X\u2019e dokunun.'}
        </Text>
        <Text variant="body" style={{ marginTop: 12 }}>
          Türkçe karakter: ğ ü ş ı İ ö ç Ğ Ü Ş Ö Ç
        </Text>
      </BottomSheet>

      <ConfirmDialog
        visible={dialogVisible}
        title={tr.deleteDialog.title}
        message={tr.deleteDialog.message}
        confirmLabel={tr.deleteDialog.confirm}
        cancelLabel={tr.deleteDialog.cancel}
        onConfirm={() => setDialogVisible(false)}
        onCancel={() => setDialogVisible(false)}
        dangerous
      />

      <EmojiPicker
        visible={emojiPickerVisible}
        onClose={() => setEmojiPickerVisible(false)}
        onSelect={(e) => {
          setEmojiSelected(e);
          setEmojiPickerVisible(false);
        }}
        emojis={AvatarEmojis}
        selected={emojiSelected}
        title="Avatar Seç"
      />

      <EmojiPicker
        visible={groupEmojiPickerVisible}
        onClose={() => setGroupEmojiPickerVisible(false)}
        onSelect={(e) => {
          setGroupEmojiSel(e);
          setGroupEmojiPickerVisible(false);
        }}
        emojis={GroupEmojis}
        selected={groupEmojiSel}
        title="Grup Emojisi Seç"
      />

      <Snackbar
        visible={snackVisible}
        message={tr.snackbar.saved}
        actionLabel={tr.snackbar.undoDelete}
        onAction={() => setSnackVisible(false)}
        onDismiss={() => setSnackVisible(false)}
        variant="success"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
