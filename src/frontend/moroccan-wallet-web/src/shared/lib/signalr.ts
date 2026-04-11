import { HubConnectionBuilder, LogLevel, type HubConnection } from '@microsoft/signalr';
import { authStore } from '../../features/auth/store/auth.store';

let connection: HubConnection | null = null;

export function getNotificationsConnection() {
  if (connection) return connection;

  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
  connection = new HubConnectionBuilder()
    .withUrl(`${base}/hubs/notifications`, {
      accessTokenFactory: () => authStore.getState().accessToken ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  return connection;
}
