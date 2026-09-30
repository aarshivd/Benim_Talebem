/**
 * src/features/students/hooks.ts
 * TanStack Query hooks for students feature.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/db/client';
import {
  listByGroup,
  getStudent,
  createStudent,
  updateStudent,
  softDeleteStudent,
  moveToGroup,
} from '@/db/repositories/students';
import { students as studentsTable } from '@/db/schema';
import type { NewStudent } from '@/db/schema';
import { nowIso } from '@/lib/time';
import { newId } from '@/lib/id';

export const STUDENT_KEYS = {
  all: ['students'] as const,
  byGroup: (groupId: string, opts?: object) => ['students', 'group', groupId, opts] as const,
  detail: (id: string) => ['students', id] as const,
};

export interface StudentListOptions {
  search?: string;
  includeInactive?: boolean;
}

// ─── Queries ────────────────────────────────────────────────────────────────

export function useStudents(groupId: string, opts: StudentListOptions = {}) {
  return useQuery({
    queryKey: STUDENT_KEYS.byGroup(groupId, opts),
    queryFn: () => listByGroup(db, groupId, opts),
    enabled: !!groupId,
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: STUDENT_KEYS.detail(id),
    queryFn: () => getStudent(db, id),
    enabled: !!id,
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

type CreateStudentInput = Omit<NewStudent, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
type UpdateStudentInput = Partial<CreateStudentInput>;

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentInput) => createStudent(db, data),
    onSuccess: (_r, data) => {
      qc.invalidateQueries({ queryKey: STUDENT_KEYS.byGroup(data.groupId) });
      qc.invalidateQueries({ queryKey: ['groups'] }); // refresh counts
    },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentInput }) =>
      updateStudent(db, id, data),
    onSuccess: (_r, { id, data }) => {
      qc.invalidateQueries({ queryKey: STUDENT_KEYS.detail(id) });
      if (data.groupId) {
        qc.invalidateQueries({ queryKey: STUDENT_KEYS.byGroup(data.groupId) });
      }
      qc.invalidateQueries({ queryKey: STUDENT_KEYS.all });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteStudent(db, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENT_KEYS.all });
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useMoveStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentIds, groupId }: { studentIds: string[]; groupId: string }) =>
      moveToGroup(db, studentIds, groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENT_KEYS.all });
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useSetStudentActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateStudent(db, id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: STUDENT_KEYS.all }),
  });
}

/** Bulk create: all in one transaction */
export function useBulkCreateStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (students: CreateStudentInput[]) => {
      await db.transaction(async (tx) => {
        const now = nowIso();
        for (const s of students) {
          const id = newId();
          await tx.insert(studentsTable).values({
            ...s,
            id,
            createdAt: now,
            updatedAt: now,
          });
        }
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENT_KEYS.all });
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
