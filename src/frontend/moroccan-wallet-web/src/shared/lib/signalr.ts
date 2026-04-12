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
  private timer: number | null = null;

  async start() {
    if (this.state === 'Connected') return;
    this.state = 'Connected';

    this.timer = window.setInterval(() => {
      const payload: NotificationPayload = {
        id: `live-${Date.now()}`,
        title: 'Live household update',
        message: 'Mock realtime notification received.',
        createdAt: new Date().toISOString(),
        kind: 'system',
      };
      this.emit('ReceiveNotification', payload);
    }, 45000);
  }

  async stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
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
