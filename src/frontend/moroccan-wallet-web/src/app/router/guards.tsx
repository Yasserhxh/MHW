import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';

export function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const emailVerified = useAuthStore((s) => s.emailVerified);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!emailVerified) return <Navigate to="/verify-email" replace />;
  if (!onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export function RequireGuest({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  return isAuthenticated ? <Navigate to={onboardingCompleted ? '/dashboard' : '/onboarding'} replace /> : <>{children}</>;
}

export function RequireOnboarding({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  const emailVerified = useAuthStore((s) => s.emailVerified);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!emailVerified) return <Navigate to="/verify-email" replace />;
  return onboardingCompleted ? <>{children}</> : <Navigate to="/onboarding" replace />;
}

export function RequireIncompleteOnboarding({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  const emailVerified = useAuthStore((s) => s.emailVerified);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!emailVerified) return <Navigate to="/verify-email" replace />;
  return onboardingCompleted ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}
