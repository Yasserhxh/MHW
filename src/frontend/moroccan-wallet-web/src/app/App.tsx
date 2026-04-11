import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { router } from './router';
import { useAuthStore } from '../features/auth/store/auth.store';
import { useNotificationRealtime } from '../features/notifications/hooks/useNotificationRealtime';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <AppProviders>
      <RealtimeBootstrap />
      <RouterProvider router={router} />
    </AppProviders>
  );
}
