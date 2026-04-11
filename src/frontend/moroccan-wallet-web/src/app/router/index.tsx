import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ErrorLayout } from '../layouts/ErrorLayout';
import { RequireAuth, RequireGuest } from './guards';
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '../../features/auth/pages/VerifyEmailPage';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import ExpensesPage from '../../features/expenses/pages/ExpensesPage';
import NewExpensePage from '../../features/expenses/pages/NewExpensePage';
import SharedExpensesPage from '../../features/shared-expenses/pages/SharedExpensesPage';
import SharedExpenseDetailPage from '../../features/shared-expenses/pages/SharedExpenseDetailPage';
import GroceryPricesPage from '../../features/grocery-prices/pages/GroceryPricesPage';
import RemindersPage from '../../features/reminders/pages/RemindersPage';
import NotificationsPage from '../../features/notifications/pages/NotificationsPage';
import ProfileSettingsPage from '../../features/settings/pages/ProfileSettingsPage';
import PreferenceSettingsPage from '../../features/settings/pages/PreferenceSettingsPage';
import SecuritySettingsPage from '../../features/settings/pages/SecuritySettingsPage';
import { ForbiddenPage, NotFoundPage, ServerErrorPage } from '../../features/errors/pages/ErrorPages';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <RequireGuest><LoginPage /></RequireGuest> },
      { path: '/register', element: <RequireGuest><RegisterPage /></RequireGuest> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
    ],
  },
  {
    element: <RequireAuth><AppLayout /></RequireAuth>,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/expenses', element: <ExpensesPage /> },
      { path: '/expenses/new', element: <NewExpensePage /> },
      { path: '/shared-expenses', element: <SharedExpensesPage /> },
      { path: '/shared-expenses/:id', element: <SharedExpenseDetailPage /> },
      { path: '/grocery-prices', element: <GroceryPricesPage /> },
      { path: '/reminders', element: <RemindersPage /> },
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/settings/profile', element: <ProfileSettingsPage /> },
      { path: '/settings/preferences', element: <PreferenceSettingsPage /> },
      { path: '/settings/security', element: <SecuritySettingsPage /> },
    ],
  },
  {
    element: <ErrorLayout />,
    children: [
      { path: '/403', element: <ForbiddenPage /> },
      { path: '/404', element: <NotFoundPage /> },
      { path: '/500', element: <ServerErrorPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/404" replace /> },
]);
