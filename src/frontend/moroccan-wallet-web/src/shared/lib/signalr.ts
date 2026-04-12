import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { authStore } from '../../features/auth/store/auth.store';

type NotificationPayload = {
  id: string;
  kind?: string;
  title: string;
  message?: string;
  createdAt: string;
  actionUrl?: string;
  isRead?: boolean;
};
type EventMap = {
  ReceiveNotification: NotificationPayload;
  UnreadCountChanged: number;
};

type ConnectionState = 'Disconnected' | 'Connected';

class NotificationConnection {
  public state: ConnectionState = 'Disconnected';
  private listeners: { [K in keyof EventMap]?: Set<(payload: EventMap[K]) => void> } = {};
  private connection: HubConnection | null = null;
  private initialized = false;

  private createConnection() {
    const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

    return new HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/notifications`, {
        accessTokenFactory: () => authStore.getState().accessToken ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Error)
      .build();
  }

  private registerHandlers(connection: HubConnection) {
    if (this.initialized) {
      return;
    }

    connection.on('ReceiveNotification', (payload: NotificationPayload) => {
      this.emit('ReceiveNotification', payload);
    });

    connection.on('UnreadCountChanged', (payload: number) => {
      this.emit('UnreadCountChanged', payload);
    });

    connection.onreconnecting(() => {
      this.state = 'Disconnected';
    });

    connection.onreconnected(() => {
      this.state = 'Connected';
    });

    connection.onclose(() => {
      this.state = 'Disconnected';
    });

    this.initialized = true;
  }

  async start() {
    if (this.state === 'Connected') return;
    if (!authStore.getState().accessToken) return;

    try {
      if (!this.connection) {
        this.connection = this.createConnection();
        this.registerHandlers(this.connection);
      }

      if (this.connection.state === HubConnectionState.Disconnected) {
        await this.connection.start();
      }

      this.state = 'Connected';
    } catch {
      this.state = 'Disconnected';
    }
  }

  async stop() {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      await this.connection.stop();
    }
    this.state = 'Disconnected';
  }

  on<K extends keyof EventMap>(event: K, cb: (payload: EventMap[K]) => void) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]?.add(cb);
  }

  off<K extends keyof EventMap>(event: K, cb?: (payload: EventMap[K]) => void) {
    if (!cb) {
      this.listeners[event]?.clear();
      return;
    }
    this.listeners[event]?.delete(cb);
  }

  private emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    this.listeners[event]?.forEach((cb) => cb(payload));
  }
}

let connection: NotificationConnection | null = null;

export function getNotificationsConnection() {
  if (!connection) connection = new NotificationConnection();
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
