import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';

const key = ['notifications'] as const;

export function useNotifications() {
  return useQuery({ queryKey: key, queryFn: async () => (await notificationsApi.list()).data });
}

export function useNotificationActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: key });
  return {
    markRead: useMutation({ mutationFn: async (id: string) => (await notificationsApi.markRead(id)).data, onSuccess: invalidate }),
    markAllRead: useMutation({ mutationFn: async () => (await notificationsApi.markAllRead()).data, onSuccess: invalidate }),
  };
}
