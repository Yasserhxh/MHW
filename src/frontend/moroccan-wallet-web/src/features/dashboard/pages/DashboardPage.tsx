import { useEffect } from 'react';
import { useAuthStore } from '../../auth/store/auth.store';
import { startNotificationConnection, getNotificationConnection } from '../../../lib/signalr';

export default function DashboardPage() {
  const { email, clearAuth, accessToken, refreshToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    startNotificationConnection().catch(console.error);

    const conn = getNotificationConnection();
    conn.on('ReceiveNotification', (notification) => {
      console.log('New notification:', notification);
      // TODO: push to notifications store
    });

    return () => {
      conn.off('ReceiveNotification');
    };
  }, [accessToken]);

  const handleLogout = async () => {
    if (refreshToken && accessToken) {
      try {
        const { authApi } = await import('../../auth/api/auth.api');
        await authApi.logout(refreshToken, accessToken);
      } catch {
        // Continue with local logout regardless
      }
    }
    clearAuth();
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Moroccan Wallet</h1>
      <p>Welcome, {email}</p>
      <nav>
        <ul>
          <li>Transactions (coming soon)</li>
          <li>Wallets (coming soon)</li>
          <li>Shared Expenses (coming soon)</li>
          <li>Grocery Prices (coming soon)</li>
          <li>Reminders (coming soon)</li>
          <li>Notifications (coming soon)</li>
        </ul>
      </nav>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
