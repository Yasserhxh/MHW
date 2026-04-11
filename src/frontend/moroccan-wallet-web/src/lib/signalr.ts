import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { useAuthStore } from '../features/auth/store/auth.store';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

let connection: HubConnection | null = null;

export function getNotificationConnection(): HubConnection {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/notifications`, {
        accessTokenFactory: () =>
          useAuthStore.getState().accessToken ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
  }
  return connection;
}

export async function startNotificationConnection(): Promise<void> {
  const conn = getNotificationConnection();
  if (conn.state === HubConnectionState.Disconnected) {
    await conn.start();
  }
}

export async function stopNotificationConnection(): Promise<void> {
  const conn = getNotificationConnection();
  if (conn.state !== HubConnectionState.Disconnected) {
    await conn.stop();
  }
}
