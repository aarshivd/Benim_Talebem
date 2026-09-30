/**
 * src/features/terms/hooks.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/db/client';
import {
  listTerms,
  getTerm,
  getActiveTerm,
  createTerm,
  updateTerm,
  softDeleteTerm,
  setActiveTerm,
} from '@/db/repositories/terms';
import type { NewTerm } from '@/db/schema';

export const TERM_KEYS = {
  all: ['terms'] as const,
  detail: (id: string) => ['terms', id] as const,
  active: ['terms', 'active'] as const,
};

export function useTerms() {
  return useQuery({
    queryKey: TERM_KEYS.all,
    queryFn: () => listTerms(db),
  });
}

export function useTerm(id: string) {
  return useQuery({
    queryKey: TERM_KEYS.detail(id),
    queryFn: () => getTerm(db, id),
    enabled: !!id,
  });
}

export function useActiveTerm() {
  return useQuery({
    queryKey: TERM_KEYS.active,
    queryFn: () => getActiveTerm(db),
  });
}

export function useCreateTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createTerm>[1]) => createTerm(db, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TERM_KEYS.all });
      qc.invalidateQueries({ queryKey: TERM_KEYS.active });
    },
  });
}

export function useUpdateTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTerm>[2] }) =>
      updateTerm(db, id, data),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: TERM_KEYS.all });
      qc.invalidateQueries({ queryKey: TERM_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: TERM_KEYS.active });
    },
  });
}

export function useDeleteTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteTerm(db, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TERM_KEYS.all });
      qc.invalidateQueries({ queryKey: TERM_KEYS.active });
    },
  });
}

export function useSetActiveTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setActiveTerm(db, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TERM_KEYS.all });
      qc.invalidateQueries({ queryKey: TERM_KEYS.active });
    },
  });
}
