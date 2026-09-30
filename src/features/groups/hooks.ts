/**
 * src/features/groups/hooks.ts
 * TanStack Query hooks for groups feature.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/db/client';
import { listGroups, getGroup, createGroup, updateGroup, softDeleteGroup } from '@/db/repositories/groups';
import { countByGroup } from '@/db/repositories/students';

export const GROUP_KEYS = {
  all: ['groups'] as const,
  detail: (id: string) => ['groups', id] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

export function useGroups() {
  return useQuery({
    queryKey: GROUP_KEYS.all,
    queryFn: () => listGroups(db),
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: GROUP_KEYS.detail(id),
    queryFn: () => getGroup(db, id),
    enabled: !!id,
  });
}

/** Groups with student counts, used in groups tab list */
export function useGroupsWithCounts() {
  return useQuery({
    queryKey: [...GROUP_KEYS.all, 'with-counts'],
    queryFn: async () => {
      const groups = await listGroups(db);
      const withCounts = await Promise.all(
        groups.map(async (g) => ({
          ...g,
          studentCount: await countByGroup(db, g.id),
        })),
      );
      return withCounts;
    },
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

type CreateGroupInput = Parameters<typeof createGroup>[1];
type UpdateGroupInput = Parameters<typeof updateGroup>[2];

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupInput) => createGroup(db, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: GROUP_KEYS.all }),
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupInput }) =>
      updateGroup(db, id, data),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all });
      qc.invalidateQueries({ queryKey: GROUP_KEYS.detail(id) });
    },
  });
}

export function useArchiveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, archive }: { id: string; archive: boolean }) =>
      updateGroup(db, id, { isArchived: archive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: GROUP_KEYS.all }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteGroup(db, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: GROUP_KEYS.all }),
  });
}
