import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardQueryKey } from '@/features/dashboard/hooks/useDashboard';
import { remindersApi } from '../api/reminders.api';
import type { CreateReminderRequest } from '../types/reminders.types';

export const remindersQueryKey = ['reminders'] as const;

function invalidateReminderDependencies(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: remindersQueryKey });
  void qc.invalidateQueries({ queryKey: dashboardQueryKey });
  void qc.invalidateQueries({ queryKey: ['notifications'] });
}

export function useReminders() {
  return useQuery({ queryKey: remindersQueryKey, queryFn: async () => (await remindersApi.list()).data });
}

export function useReminder(id?: string) {
  return useQuery({
    queryKey: [...remindersQueryKey, id],
    queryFn: async () => (await remindersApi.getById(id!)).data,
    enabled: Boolean(id),
  });
}

export function useSaveReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: CreateReminderRequest }) => (await remindersApi.save(payload, id)).data,
    onSuccess: () => invalidateReminderDependencies(qc),
  });
}

export function useCompleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await remindersApi.markComplete(id)).data,
    onSuccess: () => invalidateReminderDependencies(qc),
  });
}

export function useSnoozeReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, until }: { id: string; until: string }) => (await remindersApi.snooze(id, until)).data,
    onSuccess: () => invalidateReminderDependencies(qc),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await remindersApi.remove(id)).data,
    onSuccess: () => invalidateReminderDependencies(qc),
  });
}
