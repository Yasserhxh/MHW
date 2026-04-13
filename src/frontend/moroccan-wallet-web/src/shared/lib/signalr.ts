import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { getApiBaseUrl } from '@/shared/api/client';
import { authStore } from '@/features/auth/store/auth.store';

type NotificationPayload = {
  id: string;
  type?: string;
  title: string;
  body?: string;
  createdAt: string;
  data?: unknown;
};

type UnreadCountPayload = {
  count: number;
};

type EventMap = {
  Notification: NotificationPayload;
  UnreadCountChanged: UnreadCountPayload;
};

type ConnectionState = 'Disconnected' | 'Connected';

class NotificationConnection {
  private connection: HubConnection | null = null;

  get state(): ConnectionState {
    return this.connection?.state === HubConnectionState.Connected ? 'Connected' : 'Disconnected';
  }

  private ensureConnection() {
    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl(`${getApiBaseUrl()}/hubs/notifications`, {
          accessTokenFactory: () => authStore.getState().accessToken ?? '',
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();
    }

    return this.connection;
  }

  async start() {
    const connection = this.ensureConnection();
    if (connection.state === HubConnectionState.Connected || connection.state === HubConnectionState.Connecting) {
      return;
    }

    await connection.start();
  }

  async stop() {
    if (!this.connection || this.connection.state === HubConnectionState.Disconnected) {
      return;
    }

    await this.connection.stop();
  }

  on<K extends keyof EventMap>(event: K, cb: (payload: EventMap[K]) => void) {
    this.ensureConnection().on(event, cb);
  }

  off<K extends keyof EventMap>(event: K, cb?: (payload: EventMap[K]) => void) {
    if (!this.connection) {
      return;
    }

    if (cb) {
      this.connection.off(event, cb);
      return;
    }

    this.connection.off(event);
  }
}

let connection: NotificationConnection | null = null;

export function getNotificationsConnection() {
  if (!connection) {
    connection = new NotificationConnection();
  }

  return connection;
}

export function getNotificationConnection() {
  return getNotificationsConnection();
}

export async function startNotificationConnection() {
  await getNotificationsConnection().start();
}

export async function stopNotificationConnection() {
  await getNotificationsConnection().stop();
}
