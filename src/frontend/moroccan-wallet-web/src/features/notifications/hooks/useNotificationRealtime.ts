import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getNotificationsConnection } from '../../../shared/lib/signalr';
import { useNotificationsStore } from './notifications.store';

export function useNotificationRealtime(enabled: boolean) {
  const queryClient = useQueryClient();
  const push = useNotificationsStore((s) => s.push);
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (!enabled) return;
    const conn = getNotificationsConnection();
    const handleNotification = (payload: { id: string; title: string; body?: string; createdAt: string }) => {
      push({
        id: payload.id,
        title: payload.title,
        createdAt: payload.createdAt,
        read: false,
      });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };
    const handleUnreadCount = (payload: { count: number }) => {
      setUnreadCount(payload.count);
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const start = async () => {
      try {
        if (conn.state === 'Disconnected') await conn.start();
      } catch {
        // graceful degradation by ignoring realtime failures
      }
    };

    conn.on('Notification', handleNotification);
    conn.on('UnreadCountChanged', handleUnreadCount);

    start();

    return () => {
      conn.off('Notification', handleNotification);
      conn.off('UnreadCountChanged', handleUnreadCount);
    };
  }, [enabled, push, queryClient, setUnreadCount]);
}
