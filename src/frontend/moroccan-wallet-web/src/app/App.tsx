import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { router } from './router';
import { useAuthStore } from '../features/auth/store/auth.store';
import { useNotificationRealtime } from '../features/notifications/hooks/useNotificationRealtime';

function RealtimeBootstrap() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  useNotificationRealtime(isAuthenticated);
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
