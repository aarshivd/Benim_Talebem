/**
 * app/__dev/demo.tsx
 * Demo veri oluşturma ve temizleme işlemleri (Sadece geliştirme modunda)
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, Text, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { db } from '@/db/client';
import * as schema from '@/db/schema';
import { giveManualPoints } from '@/features/points/service';
import { recordReading } from '@/features/reading/service';
import { newId } from '@/lib/id';
import { logger } from '@/lib/logger';
import { clearAllData } from '@/lib/backup';
import { todayLocal } from '@/domain';

export default function DemoScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleGenerateDemoData = async () => {
    try {
      setLoading(true);
      await clearAllData();

      const today = new Date(todayLocal());

      // Dönem
      const termId = newId();
      await db.insert(schema.terms).values({
        id: termId,
        name: 'Güz Dönemi',
        startDate: new Date(today.getFullYear(), 8, 1).toISOString().split('T')[0],
        endDate: new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0],
        isActive: true,
      });

      // Gruplar (3 grup)
      const groups = [
        { id: newId(), name: 'Yıldızlar', emoji: '⭐', level: 'ilkokul' as const, color: 0 },
        { id: newId(), name: 'Şampiyonlar', emoji: '🏆', level: 'ortaokul' as const, color: 1 },
        { id: newId(), name: 'Bilginler', emoji: '🧠', level: 'lise' as const, color: 2 },
      ];
      await db.insert(schema.groups).values(groups);

      // Kitaplar (8 kitap)
      const books = Array.from({ length: 8 }).map((_, i) => ({
        id: newId(),
        title: `Kitap ${i + 1}`,
        author: `Yazar ${i + 1}`,
        totalPages: 100 + i * 50,
      }));
      await db.insert(schema.books).values(books);

      // Talebeler (30 talebe, her gruba 10)
      const students = [];
      const firstNames = [
        'Ahmet',
        'Mehmet',
        'Ayşe',
        'Fatma',
        'Ali',
        'Veli',
        'Zeynep',
        'Elif',
        'Mustafa',
        'Emine',
        'Ömer',
        'Hüseyin',
        'Hasan',
        'İbrahim',
        'İsmail',
        'Hatice',
        'Meryem',
        'Kadir',
        'Enes',
        'Yusuf',
        'Burak',
        'Cem',
        'Deniz',
        'Ege',
        'Furkan',
        'Gizem',
        'Hakan',
        'Irmak',
        'Kaan',
        'Leyla',
      ];
      const lastNames = [
        'Yılmaz',
        'Kaya',
        'Demir',
        'Çelik',
        'Şahin',
        'Yıldız',
        'Öztürk',
        'Aydın',
        'Özdemir',
        'Arslan',
        'Doğan',
        'Kılıç',
        'Aslan',
        'Çetin',
        'Kara',
        'Koç',
        'Kurt',
        'Özkan',
        'Şimşek',
      ];

      for (let i = 0; i < 30; i++) {
        const groupId = groups[i % 3].id;
        students.push({
          id: newId(),
          groupId,
          firstName: firstNames[i % firstNames.length],
          lastName: lastNames[i % lastNames.length],
          avatar: ['👦', '👧', '👨', '👩', '👱‍♂️', '👱‍♀️'][i % 6],
        });
      }
      await db.insert(schema.students).values(students);

      // Puan kuralları ve Ödüller (seed ile eklendiğini varsayıyoruz ama biz yine de alalım)
      const pointRules = await db.select().from(schema.pointRules);
      const randomRuleId = pointRules.length > 0 ? pointRules[0].id : null;

      // Ödüller
      const rewards = [
        {
          id: newId(),
          name: 'Haftanın Birincisi',
          description: '',
          icon: '🥇',
          kind: 'rank' as const,
          targetPoints: 1,
          scope: 'daily' as const,
          isActive: true,
        },
        {
          id: newId(),
          name: '500 Puan Hedefi',
          description: '',
          icon: '🎯',
          kind: 'points' as const,
          targetPoints: 500,
          scope: 'term' as const,
          isActive: true,
        },
      ];
      await db.insert(schema.rewards).values(rewards);

      // 60 günlük okuma ve puan kaydı (Geriye dönük)
      logger.info('Generating 60 days of logs...');
      const studentProgress: Record<string, Record<string, number>> = {};

      for (let i = 60; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        // Her gün rastgele 15 öğrenciye okuma girelim
        const dailyReaders = students.sort(() => 0.5 - Math.random()).slice(0, 15);
        for (const s of dailyReaders) {
          const book = books[Math.floor(Math.random() * books.length)];
          const current = studentProgress[s.id]?.[book.id] ?? 0;
          const pagesRead = Math.floor(Math.random() * 20) + 1; // 1-20 sayfa
          const toPage = Math.min(current + pagesRead, book.totalPages);

          await recordReading(db, {
            studentId: s.id,
            bookId: book.id,
            bookTotalPages: book.totalPages,
            toPage,
            date: dateStr,
          });

          if (!studentProgress[s.id]) studentProgress[s.id] = {};
          studentProgress[s.id][book.id] = toPage;

          // %30 ihtimalle manuel puan verelim
          if (randomRuleId && Math.random() > 0.7) {
            await giveManualPoints(db, {
              studentIds: [s.id],
              points: 5,
              ruleId: randomRuleId,
              title: 'Harika Davranış',
              date: dateStr,
            });
          }
        }
      }

      await queryClient.invalidateQueries();
      Alert.alert('Başarılı', 'Demo veriler oluşturuldu.');
    } catch (e: any) {
      logger.error('Demo data generation failed', e);
      Alert.alert('Hata', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Demo Araçları" showBack scroll>
      <ScrollView contentContainerStyle={{ padding: spacing.base, gap: spacing.lg }}>
        <Text variant="body" color={colors.ink}>
          Geliştirme modundasınız. Bu araçları kullanarak arayüzü ve performansı test edebileceğiniz
          kalabalık veriler oluşturabilirsiniz.
        </Text>

        <View
          style={{
            backgroundColor: colors.dangerSoft,
            padding: spacing.md,
            borderRadius: radius.lg,
          }}
        >
          <Text variant="captionSemi" color={colors.danger}>
            DİKKAT
          </Text>
          <Text variant="caption" color={colors.danger}>
            Veri yüklemek, mevcut tüm gerçek verilerinizi tamamen SİLER!
          </Text>
        </View>

        <Button
          label="Demo Veri Yükle (30 Talebe, 60 Gün)"
          variant="primary"
          loading={loading}
          onPress={() => {
            Alert.alert(
              'Emin misiniz?',
              'Tüm mevcut veriler silinecek ve yerini rastgele demo veriler alacak.',
              [
                { text: 'İptal', style: 'cancel' },
                { text: 'Yükle', style: 'destructive', onPress: handleGenerateDemoData },
              ],
            );
          }}
        />

        <Button
          label="Tüm Verileri Temizle"
          variant="danger"
          loading={loading}
          onPress={() => {
            Alert.alert('Emin misiniz?', 'Sistemdeki her şey silinecek.', [
              { text: 'İptal', style: 'cancel' },
              {
                text: 'Sil',
                style: 'destructive',
                onPress: async () => {
                  setLoading(true);
                  await clearAllData();
                  await queryClient.invalidateQueries();
                  setLoading(false);
                  Alert.alert('Temizlendi', 'Veritabanı sıfırlandı.');
                },
              },
            ]);
          }}
        />
      </ScrollView>
    </Screen>
  );
}
