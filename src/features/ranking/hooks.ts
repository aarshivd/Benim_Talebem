/**
 * src/features/ranking/hooks.ts
 *
 * Puan ve okuma verilerinden sıralama oluşturma hook'ları.
 */

import { useQuery } from '@tanstack/react-query';
import { db } from '@/db/client';
import { getTotals } from '@/db/repositories/pointEvents';
import { listActiveStudents } from '@/db/repositories/students';
import { listRewards } from '@/db/repositories/rewards';
import { getTerm } from '@/db/repositories/terms';
import { rankStudents, evaluateRewards } from '@/domain';
import type { RankedResult } from '@/domain/ranking';
import type { Student } from '@/db/schema';

export interface RankingOptions {
  scope: 'daily' | 'term';
  day?: string;      // YYYY-MM-DD
  termId?: string;
  groupId?: string;
}

export function useRanking(options: RankingOptions) {
  return useQuery({
    queryKey: ['ranking', options],
    queryFn: async () => {
      let from = '';
      let to = '';

      if (options.scope === 'daily') {
        if (!options.day) throw new Error('Daily scope requires day parameter');
        from = options.day;
        to = options.day;
      } else {
        if (!options.termId) throw new Error('Term scope requires termId parameter');
        const term = await getTerm(db, options.termId);
        if (!term) throw new Error('Term not found');
        from = term.startDate;
        to = term.endDate;
      }

      // 1. O tarihler arasındaki ve (opsiyonel) gruptaki toplamları al
      const totals = await getTotals(db, { from, to, groupId: options.groupId });
      
      // 2. İlgili tüm aktif talebeleri al (isim, avatar vb. için)
      // Burada sadece totals içinde dönen veya aktif olan öğrencileri alıp birleştiriyoruz.
      const allActiveStudents = await listActiveStudents(db, options.groupId);

      // totals dizisini mapleyip rankStudents için RankedRow formuna getir
      const rowsToRank = allActiveStudents.map((s: Student) => {
        const studentTotals = totals.find((t) => t.studentId === s.id);
        return {
          studentId: s.id,
          name: `${s.firstName} ${s.lastName}`,
          points: studentTotals?.points ?? 0,
          pages: studentTotals?.pages ?? 0,
          // Ekstra UI için gerekli alanları pass through yapalım (domain sadece point/page/name kullanır ama objeyi koruyabiliriz)
          avatar: s.avatar,
          groupId: s.groupId,
          grade: s.grade,
        };
      });

      // 3. Domain mantığıyla sırala
      const rankedRows = rankStudents(rowsToRank) as (RankedResult & { avatar: string | null; groupId: string; grade: number | null })[];

      // 4. Ödülleri değerlendir
      const allRewards = await listRewards(db);
      // domain objeleri reward kuralı bekliyor
      const domainRewards = allRewards.map(r => ({
        id: r.id,
        scope: r.scope,
        kind: r.kind,
        targetPoints: r.targetPoints,
        rankTop: r.rankTop,
      }));

      const earnedRewards = evaluateRewards(domainRewards, rankedRows, options.scope);

      // Ekstra olarak ödül tanımlarını da döndürüp UI'da icon/isim basılmasını sağlayalım
      return {
        rankedRows,
        earnedRewards, // Record<studentId, rewardId[]>
        allRewards,    // Ödül tanımları (isim, ikon eşleştirmek için)
      };
    },
    enabled: options.scope === 'daily' ? !!options.day : !!options.termId,
  });
}
