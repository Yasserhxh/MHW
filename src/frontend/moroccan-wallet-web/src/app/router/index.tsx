import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ErrorLayout } from '../layouts/ErrorLayout';
import { RequireGuest, RequireIncompleteOnboarding, RequireOnboarding } from './guards';
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '../../features/auth/pages/VerifyEmailPage';
import AuthSuccessPage from '../../features/auth/pages/AuthSuccessPage';
import AuthErrorPage from '../../features/auth/pages/AuthErrorPage';
import OnboardingPage from '../../features/onboarding/pages/OnboardingPage';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import ExpensesPage from '../../features/expenses/pages/ExpensesPage';
import NewExpensePage from '../../features/expenses/pages/NewExpensePage';
import ExpenseDetailPage from '../../features/expenses/pages/ExpenseDetailPage';
import WalletsPage from '../../features/wallets/pages/WalletsPage';
import WalletDetailPage from '../../features/wallets/pages/WalletDetailPage';
import CategoriesPage from '../../features/categories/pages/CategoriesPage';
import SharedExpensesPage from '../../features/shared-expenses/pages/SharedExpensesPage';
import SharedExpenseDetailPage from '../../features/shared-expenses/pages/SharedExpenseDetailPage';
import NewSharedExpensePage from '../../features/shared-expenses/pages/NewSharedExpensePage';
import GroceryPricesPage from '../../features/grocery-prices/pages/GroceryPricesPage';
import GroceryPriceDetailPage from '../../features/grocery-prices/pages/GroceryPriceDetailPage';
import RemindersPage from '../../features/reminders/pages/RemindersPage';
import ReminderDetailPage from '../../features/reminders/pages/ReminderDetailPage';
import NewReminderPage from '../../features/reminders/pages/NewReminderPage';
import NotificationsPage from '../../features/notifications/pages/NotificationsPage';
import ProfileSettingsPage from '../../features/settings/pages/ProfileSettingsPage';
import PreferenceSettingsPage from '../../features/settings/pages/PreferenceSettingsPage';
import SecuritySettingsPage from '../../features/settings/pages/SecuritySettingsPage';
import NotificationSettingsPage from '../../features/settings/pages/NotificationSettingsPage';
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
      { path: '/auth/success', element: <AuthSuccessPage /> },
      { path: '/auth/error', element: <AuthErrorPage /> },
    ],
  },
  {
    path: '/onboarding',
    element: <RequireIncompleteOnboarding><OnboardingPage /></RequireIncompleteOnboarding>,
  },
  {
    element: <RequireOnboarding><AppLayout /></RequireOnboarding>,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/expenses', element: <ExpensesPage /> },
      { path: '/expenses/new', element: <NewExpensePage /> },
      { path: '/expenses/:id', element: <ExpenseDetailPage /> },
      { path: '/wallets', element: <WalletsPage /> },
      { path: '/wallets/:id', element: <WalletDetailPage /> },
      { path: '/categories', element: <CategoriesPage /> },
      { path: '/shared-expenses', element: <SharedExpensesPage /> },
      { path: '/shared-expenses/new', element: <NewSharedExpensePage /> },
      { path: '/shared-expenses/:id', element: <SharedExpenseDetailPage /> },
      { path: '/grocery-prices', element: <GroceryPricesPage /> },
      { path: '/grocery-prices/:id', element: <GroceryPriceDetailPage /> },
      { path: '/reminders', element: <RemindersPage /> },
      { path: '/reminders/new', element: <NewReminderPage /> },
      { path: '/reminders/:id', element: <ReminderDetailPage /> },
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/settings/profile', element: <ProfileSettingsPage /> },
      { path: '/settings/preferences', element: <PreferenceSettingsPage /> },
      { path: '/settings/security', element: <SecuritySettingsPage /> },
      { path: '/settings/notifications', element: <NotificationSettingsPage /> },
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
