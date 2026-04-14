import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardQueryKey } from '@/features/dashboard/hooks/useDashboard';
import { getNotificationsConnection } from '../../../shared/lib/signalr';
import { mapNotificationDto } from '../api/notifications.api';
import type { AppNotification } from '../types/notifications.types';
import { notificationsQueryKey, unreadNotificationsCountQueryKey } from './useNotifications';

type NotificationEventPayload = {
  id: string;
  type?: string;
  title: string;
  body?: string;
  createdAt: string;
};

type UnreadCountPayload = {
  count: number;
};

export function useNotificationRealtime(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const conn = getNotificationsConnection();

    if (!enabled) {
      void conn.stop();
      return;
    }

    const handleNotification = (payload: NotificationEventPayload) => {
      const next = mapNotificationDto({
        id: payload.id,
        type: payload.type ?? 'system',
        title: payload.title,
        body: payload.body,
        isRead: false,
        createdAt: payload.createdAt,
      });

      queryClient.setQueryData<AppNotification[] | undefined>(notificationsQueryKey, (items) => {
        if (!items?.length) {
          return [next];
        }

        const existingIndex = items.findIndex((item) => item.id === next.id);
        if (existingIndex >= 0) {
          return items.map((item, index) => (index === existingIndex ? { ...item, ...next } : item));
        }

        return [next, ...items];
      });

      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    };

    const handleUnreadCount = (payload: UnreadCountPayload) => {
      queryClient.setQueryData(unreadNotificationsCountQueryKey, payload.count);
    };

    const start = async () => {
      try {
        await conn.start();
      } catch {
        // graceful degradation: notifications still work via normal API polling
      }
    };

    conn.on('Notification', handleNotification);
    conn.on('UnreadCountChanged', handleUnreadCount);

    void start();

    return () => {
      conn.off('Notification', handleNotification);
      conn.off('UnreadCountChanged', handleUnreadCount);
      void conn.stop();
    };
  }, [enabled, queryClient]);
}
