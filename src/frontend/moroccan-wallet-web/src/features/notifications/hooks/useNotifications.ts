import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardQueryKey } from '@/features/dashboard/hooks/useDashboard';
import type { AppNotification } from '../types/notifications.types';
import { notificationsApi } from '../api/notifications.api';

export const notificationsQueryKey = ['notifications', 'list'] as const;
export const unreadNotificationsCountQueryKey = ['notifications', 'unread-count'] as const;

function updateNotificationInList(items: AppNotification[] | undefined, id: string) {
  if (!items) {
    return items;
  }

  return items.map((item) => (item.id === id ? { ...item, isRead: true } : item));
}

function invalidateNotificationDependencies(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: notificationsQueryKey });
  void qc.invalidateQueries({ queryKey: unreadNotificationsCountQueryKey });
  void qc.invalidateQueries({ queryKey: dashboardQueryKey });
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: async () => (await notificationsApi.list()).data,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: unreadNotificationsCountQueryKey,
    queryFn: async () => (await notificationsApi.unreadCount()).data,
  });
}

export function useNotificationActions() {
  const qc = useQueryClient();

  return {
    markRead: useMutation({
      mutationFn: async (id: string) => (await notificationsApi.markRead(id)).data,
      onSuccess: (_, id) => {
        qc.setQueryData<AppNotification[] | undefined>(notificationsQueryKey, (items) => updateNotificationInList(items, id));
        qc.setQueryData<number | undefined>(unreadNotificationsCountQueryKey, (count) =>
          typeof count === 'number' ? Math.max(0, count - 1) : count
        );
        void qc.invalidateQueries({ queryKey: dashboardQueryKey });
      },
    }),
    markAllRead: useMutation({
      mutationFn: async () => (await notificationsApi.markAllRead()).data,
      onSuccess: () => {
        qc.setQueryData<AppNotification[] | undefined>(notificationsQueryKey, (items) =>
          items?.map((item) => ({ ...item, isRead: true }))
        );
        qc.setQueryData(unreadNotificationsCountQueryKey, 0);
        void qc.invalidateQueries({ queryKey: dashboardQueryKey });
      },
    }),
    refreshAll: () => invalidateNotificationDependencies(qc),
  };
}
