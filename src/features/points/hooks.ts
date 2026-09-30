/**
 * src/features/points/hooks.ts
 *
 * Puan sistemi hook'ları.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/db/client';
import {
  listPointRules,
  getPointRule,
  createPointRule,
  updatePointRule,
  softDeletePointRule,
} from '@/db/repositories/pointRules';
import {
  listByStudent,
  getTotals,
  softDeletePointEvent,
} from '@/db/repositories/pointEvents';
import { giveManualPoints, undoManualPoints } from './service';
import type { GiveManualPointsInput } from './service';
import { eq } from 'drizzle-orm';
import { pointRules } from '@/db/schema';
import { touch } from '@/db/helpers';

export const POINT_KEYS = {
  allRules: ['pointRules'] as const,
  ruleDetail: (id: string) => ['pointRules', id] as const,
  eventsByStudent: (studentId: string) => ['pointEvents', studentId] as const,
  totals: (from: string, to: string, groupId?: string) => ['pointTotals', from, to, groupId] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

export function usePointRules() {
  return useQuery({
    queryKey: POINT_KEYS.allRules,
    queryFn: () => listPointRules(db),
  });
}

export function usePointRule(id: string) {
  return useQuery({
    queryKey: POINT_KEYS.ruleDetail(id),
    queryFn: () => getPointRule(db, id),
    enabled: !!id,
  });
}

export function usePointEvents(studentId: string) {
  return useQuery({
    queryKey: POINT_KEYS.eventsByStudent(studentId),
    queryFn: () => listByStudent(db, studentId),
    enabled: !!studentId,
  });
}

export function usePointTotals(from: string, to: string, groupId?: string) {
  return useQuery({
    queryKey: POINT_KEYS.totals(from, to, groupId),
    queryFn: () => getTotals(db, { from, to, groupId }),
    enabled: !!from && !!to,
  });
}

// ─── Mutations for Point Rules ──────────────────────────────────────────────

type CreatePointRuleInput = Parameters<typeof createPointRule>[1];
type UpdatePointRuleInput = Parameters<typeof updatePointRule>[2];

export function useCreatePointRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePointRuleInput) => createPointRule(db, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: POINT_KEYS.allRules }),
  });
}

export function useUpdatePointRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePointRuleInput }) =>
      updatePointRule(db, id, data),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: POINT_KEYS.allRules });
      qc.invalidateQueries({ queryKey: POINT_KEYS.ruleDetail(id) });
    },
  });
}

export function useDeletePointRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeletePointRule(db, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: POINT_KEYS.allRules }),
  });
}

export function useReorderPointRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await db.transaction(async (tx) => {
        for (let i = 0; i < orderedIds.length; i++) {
          await tx
            .update(pointRules)
            .set({ sortOrder: i, ...touch() })
            .where(eq(pointRules.id, orderedIds[i]));
        }
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: POINT_KEYS.allRules }),
  });
}

// ─── Mutations for Point Events ─────────────────────────────────────────────

export function useGiveManualPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GiveManualPointsInput) => giveManualPoints(db, input),
    onSuccess: (_r, input) => {
      for (const sid of input.studentIds) {
        qc.invalidateQueries({ queryKey: POINT_KEYS.eventsByStudent(sid) });
      }
      qc.invalidateQueries({ queryKey: ['pointTotals'] });
    },
  });
}

export function useUndoManualPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventIds: string[]) => undoManualPoints(db, eventIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pointEvents'] });
      qc.invalidateQueries({ queryKey: ['pointTotals'] });
    },
  });
}

export function useDeletePointEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => softDeletePointEvent(db, eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pointEvents'] });
      qc.invalidateQueries({ queryKey: ['pointTotals'] });
    },
  });
}
