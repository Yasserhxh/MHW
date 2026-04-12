import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { remindersApi } from '../api/reminders.api';
import type { ReminderRecord } from '@/shared/mocks/appData';

const key = ['reminders'] as const;

export function useReminders() {
  return useQuery({ queryKey: key, queryFn: async () => (await remindersApi.list()).data });
}

export function useReminder(id?: string) {
  return useQuery({ queryKey: [...key, id], queryFn: async () => (await remindersApi.getById(id!)).data, enabled: Boolean(id) });
}

export function useSaveReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: Omit<ReminderRecord, 'id'> }) => (await remindersApi.save(payload, id)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useReminderAction(action: 'complete' | 'snooze') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (action === 'complete' ? (await remindersApi.markComplete(id)).data : (await remindersApi.snooze(id)).data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
