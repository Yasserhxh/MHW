import { useMemo, useState } from 'react';
import { Menu as MenuIcon, ChevronDown, Settings, LogOut, User, Plus, Search } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { authApi } from '@/features/auth/api/auth.api';
import { NotificationBell } from '@/shared/components/NotificationBell';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

interface TopbarProps {
  onMenuClick: () => void;
}

const pageMeta: Array<{ match: RegExp; title: string; subtitle: string }> = [
  { match: /^\/dashboard$/, title: 'Dashboard', subtitle: 'Track today, this month, and what needs attention next.' },
  { match: /^\/expenses(\/new)?$/, title: 'Expenses', subtitle: 'Review personal spending and add transactions quickly.' },
  { match: /^\/expenses\/[^/]+$/, title: 'Expense Detail', subtitle: 'Review the transaction, metadata, and linked account details.' },
  { match: /^\/wallets(\/[^/]+)?$/, title: 'Wallets', subtitle: 'See balances by wallet and keep accounts organized.' },
  { match: /^\/categories$/, title: 'Categories', subtitle: 'Control the labels and groupings used across your finance flows.' },
  { match: /^\/shared-expenses(\/[^/]+)?$/, title: 'Shared Expenses', subtitle: 'Keep household balances and settlements easy to understand.' },
  { match: /^\/grocery-prices$/, title: 'Grocery Prices', subtitle: 'Remember prices, compare stores, and spot better deals.' },
  { match: /^\/grocery-prices\/[^/]+$/, title: 'Grocery Price Detail', subtitle: 'Track product history and compare recent entries.' },
  { match: /^\/reminders$/, title: 'Reminders', subtitle: 'Stay ahead of bills, renewals, and recurring payments.' },
  { match: /^\/reminders\/[^/]+$/, title: 'Reminder Detail', subtitle: 'Review due dates, recurrence, and delivery preferences.' },
  { match: /^\/notifications$/, title: 'Notifications', subtitle: 'See updates, reminders, and shared expense activity in one place.' },
  { match: /^\/settings\/profile$/, title: 'Profile Settings', subtitle: 'Manage your name, avatar, and account details.' },
  { match: /^\/settings\/preferences$/, title: 'Preference Settings', subtitle: 'Set your language, currency, and timezone preferences.' },
  { match: /^\/settings\/security$/, title: 'Security Settings', subtitle: 'Review password and session-related account protection.' },
  { match: /^\/settings\/notifications$/, title: 'Notification Settings', subtitle: 'Choose which household updates should reach you and where.' },
];

export function Topbar({ onMenuClick }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { email, accessToken, refreshToken, clearAuth, fullName } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotifications();
  const unreadCount = notifications.data?.filter((item) => !item.isRead).length ?? 0;
  const initials = email?.slice(0, 2).toUpperCase() ?? 'U';
  const currentPage = useMemo(
    () => pageMeta.find((item) => item.match.test(location.pathname)) ?? pageMeta[0],
    [location.pathname]
  );

  const handleLogout = async () => {
    if (refreshToken && accessToken) {
      try {
        await authApi.logout(refreshToken, accessToken);
      } catch {
        // continue
      }
    }
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-[rgba(248,251,251,0.88)] px-4 py-4 backdrop-blur lg:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="mt-0.5 rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700 lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Household Wallet</div>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-900">{currentPage.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{currentPage.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 shadow-sm lg:flex">
            <Search className="h-4 w-4" />
            <span>Search coming soon</span>
          </div>
          <Link
            to="/expenses/new"
            className="hidden items-center gap-2 rounded-2xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            Quick add
          </Link>

          <NotificationBell unreadCount={unreadCount} />

          <div className="relative ml-1">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open profile menu"
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                {initials}
              </div>
              <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 sm:block">
                {fullName ?? email}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-900/10 focus:outline-none" role="menu">
                <Link
                  to="/settings/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  to="/settings/preferences"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <Link
                  to="/settings/notifications"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                >
                  <Settings className="h-4 w-4" />
                  Notifications
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex">
        <div className="text-sm text-slate-500">
          Stay focused on due items, shared balances, and the next action that matters.
        </div>
        <div className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
          Simple household finance
        </div>
      </div>
    </header>
  );
}
