/**
 * src/features/rewards/hooks.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/db/client';
import { listRewards, getReward, createReward, updateReward, softDeleteReward } from '@/db/repositories/rewards';
import type { NewReward } from '@/db/schema';

export function useRewards() {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: () => listRewards(db),
  });
}

export function useReward(id: string) {
  return useQuery({
    queryKey: ['rewards', id],
    queryFn: () => getReward(db, id),
    enabled: !!id,
  });
}

export function useCreateReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<NewReward, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => createReward(db, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rewards'] });
      qc.invalidateQueries({ queryKey: ['ranking'] });
    },
  });
}

export function useUpdateReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<NewReward, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>> }) =>
      updateReward(db, id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['rewards'] });
      qc.invalidateQueries({ queryKey: ['rewards', variables.id] });
      qc.invalidateQueries({ queryKey: ['ranking'] });
    },
  });
}

export function useDeleteReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteReward(db, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rewards'] });
      qc.invalidateQueries({ queryKey: ['ranking'] });
    },
  });
}
