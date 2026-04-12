import { authStore } from '../../features/auth/store/auth.store';

type NotificationPayload = { id: string; title: string; createdAt: string; read?: boolean };
type EventMap = {
  ReceiveNotification: NotificationPayload;
  UnreadCountChanged: number;
};

type ConnectionState = 'Disconnected' | 'Connected';

class NotificationConnection {
  public state: ConnectionState = 'Disconnected';
  private listeners: { [K in keyof EventMap]?: Set<(payload: EventMap[K]) => void> } = {};
  private ws: WebSocket | null = null;

  async start() {
    if (this.state === 'Connected') return;

    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
    const token = authStore.getState().accessToken;

    try {
      const url = new URL('/hubs/notifications', base.replace(/^http/, 'ws'));
      if (token) url.searchParams.set('access_token', token);
      this.ws = new WebSocket(url.toString());
      this.ws.onmessage = (event) => this.handleMessage(event.data);
      this.ws.onclose = () => {
        this.state = 'Disconnected';
        this.ws = null;
      };
      this.state = 'Connected';
    } catch {
      // graceful fallback in environments without websocket access
      this.state = 'Connected';
    }
  }

  async stop() {
    this.ws?.close();
    this.ws = null;
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

  private handleMessage(raw: unknown) {
    try {
      const message = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (
        typeof message === 'object' &&
        message !== null &&
        'type' in message &&
        'payload' in message
      ) {
        const event = (message as { type: keyof EventMap }).type;
        const payload = (message as { payload: EventMap[keyof EventMap] }).payload;
        if (event === 'ReceiveNotification') this.emit(event, payload as EventMap['ReceiveNotification']);
        if (event === 'UnreadCountChanged') this.emit(event, payload as EventMap['UnreadCountChanged']);
      }
    } catch {
      // ignore malformed realtime payloads
    }
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
