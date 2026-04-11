import { useEffect } from 'react';
import { getNotificationsConnection } from '../../../shared/lib/signalr';
import { useNotificationsStore } from './notifications.store';

export function useNotificationRealtime(enabled: boolean) {
  const push = useNotificationsStore((s) => s.push);

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

    conn.on('ReceiveNotification', (payload: { id: string; title: string; createdAt: string }) => {
      push({ ...payload, read: false });
    });

    start();

    return () => {
      conn.off('ReceiveNotification');
    };
  }, [enabled, push]);
}
