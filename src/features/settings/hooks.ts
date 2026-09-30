/**
 * src/features/settings/hooks.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/db/client';
import { getAllSettings, setSetting } from '@/db/repositories/settings';
import type { AppSettings } from '@/db/repositories/settings';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => getAllSettings(db),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<AppSettings>) => {
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          await setSetting(db, key as keyof AppSettings, value as any);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
