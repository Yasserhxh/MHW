import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Spinner } from '@/shared/components/ui/Spinner';

// Layouts
const AppLayout = lazy(() => import('./layouts/AppLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/VerifyEmailPage'));

// App pages
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const ExpensesPage = lazy(() => import('@/features/expenses/pages/ExpensesPage'));
const SharedExpensesPage = lazy(() => import('@/features/shared-expenses/pages/SharedExpensesPage'));
const GroceryPricesPage = lazy(() => import('@/features/grocery-prices/pages/GroceryPricesPage'));
const RemindersPage = lazy(() => import('@/features/reminders/pages/RemindersPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));

// Error pages
const NotFoundPage = lazy(() => import('@/features/errors/pages/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@/features/errors/pages/ForbiddenPage'));
const ServerErrorPage = lazy(() => import('@/features/errors/pages/ServerErrorPage'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-48">
      <Spinner size="lg" className="text-primary-500" />
    </div>
  );
}

function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function GuestOnly() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Auth routes
  {
    element: (
      <Wrap>
        <GuestOnly />
      </Wrap>
    ),
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
          { path: '/verify-email', element: <VerifyEmailPage /> },
        ],
      },
    ],
  },

  // Protected app routes
  {
    element: (
      <Wrap>
        <RequireAuth />
      </Wrap>
    ),
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/expenses', element: <ExpensesPage /> },
          { path: '/expenses/new', element: <ExpensesPage /> },
          { path: '/shared-expenses', element: <SharedExpensesPage /> },
          { path: '/shared-expenses/:id', element: <SharedExpensesPage /> },
          { path: '/grocery-prices', element: <GroceryPricesPage /> },
          { path: '/reminders', element: <RemindersPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/settings', element: <Navigate to="/settings/profile" replace /> },
          { path: '/settings/profile', element: <SettingsPage /> },
          { path: '/settings/preferences', element: <SettingsPage /> },
          { path: '/settings/security', element: <SettingsPage /> },
        ],
      },
    ],
  },

  // Error pages (accessible everywhere)
  { path: '/403', element: <Wrap><ForbiddenPage /></Wrap> },
  { path: '/500', element: <Wrap><ServerErrorPage /></Wrap> },
  { path: '/404', element: <Wrap><NotFoundPage /></Wrap> },
  { path: '*', element: <Wrap><NotFoundPage /></Wrap> },
]);
