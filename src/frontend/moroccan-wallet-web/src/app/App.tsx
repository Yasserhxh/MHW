import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { router } from './router';
import { useAuthStore } from '../features/auth/store/auth.store';
import { useNotificationRealtime } from '../features/notifications/hooks/useNotificationRealtime';

function RealtimeBootstrap() {
  const token = useAuthStore((s) => s.accessToken);
  useNotificationRealtime(Boolean(token));
  return null;
}

export default function App() {
  return (
    <AppProviders>
      <RealtimeBootstrap />
      <RouterProvider router={router} />
    </AppProviders>
  );
}
