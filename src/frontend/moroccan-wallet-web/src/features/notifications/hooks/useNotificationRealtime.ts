import { useEffect } from 'react';
import { getNotificationsConnection } from '../../../shared/lib/signalr';
import { useNotificationsStore } from './notifications.store';

export function useNotificationRealtime(enabled: boolean) {
  const push = useNotificationsStore((s) => s.push);
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (!enabled) return;
    const conn = getNotificationsConnection();

    const start = async () => {
      try {
        if (conn.state === 'Disconnected') await conn.start();
      } catch {
        // graceful degradation by ignoring realtime failures
      }
    };

    conn.on('ReceiveNotification', (payload: { id: string; title: string; message?: string; createdAt: string }) => {
      push({
        id: payload.id,
        title: payload.title,
        createdAt: payload.createdAt,
        read: false,
      });
    });

    conn.on('UnreadCountChanged', (count: number) => {
      setUnreadCount(count);
    });

    start();

    return () => {
      conn.off('ReceiveNotification');
      conn.off('UnreadCountChanged');
    };
  }, [enabled, push, setUnreadCount]);
}
