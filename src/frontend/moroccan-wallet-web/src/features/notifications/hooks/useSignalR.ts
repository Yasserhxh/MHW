import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  startNotificationConnection,
  stopNotificationConnection,
  getNotificationConnection,
} from '@/shared/lib/signalr';

interface UseSignalROptions {
  onNotification?: (notification: unknown) => void;
  onUnreadCountChanged?: (count: number) => void;
}

export function useSignalR({ onNotification, onUnreadCountChanged }: UseSignalROptions = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const onNotificationRef = useRef(onNotification);
  const onUnreadRef = useRef(onUnreadCountChanged);

  onNotificationRef.current = onNotification;
  onUnreadRef.current = onUnreadCountChanged;

  useEffect(() => {
    if (!accessToken) return;

    startNotificationConnection().catch(console.error);

    const conn = getNotificationConnection();

    conn.on('ReceiveNotification', (notification: unknown) => {
      onNotificationRef.current?.(notification);
    });

    conn.on('UnreadCountChanged', (count: number) => {
      onUnreadRef.current?.(count);
    });

    return () => {
      conn.off('ReceiveNotification');
      conn.off('UnreadCountChanged');
    };
  }, [accessToken]);

  const stop = () => stopNotificationConnection();

  return { stop };
}
