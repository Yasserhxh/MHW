import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { AppErrorBoundary } from '../../shared/components/AppErrorBoundary';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppErrorBoundary>
      <QueryProvider>{children}</QueryProvider>
    </AppErrorBoundary>
  );
}
