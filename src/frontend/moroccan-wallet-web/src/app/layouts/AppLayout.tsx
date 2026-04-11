import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { QuickAddButton } from '../../shared/components/common';
import { NotificationBell } from '../../shared/components/NotificationBell';
import { useNotificationsStore } from '../../features/notifications/hooks/notifications.store';
import { useAuthStore } from '../../features/auth/store/auth.store';

const navItems = [
  ['Dashboard', '/dashboard'],
  ['Expenses', '/expenses'],
  ['Shared Expenses', '/shared-expenses'],
  ['Grocery Prices', '/grocery-prices'],
  ['Reminders', '/reminders'],
  ['Notifications', '/notifications'],
  ['Settings', '/settings/profile'],
] as const;

export function AppLayout() {
  const unread = useNotificationsStore((s) => s.unreadCount);
  const location = useLocation();
  const email = useAuthStore((s) => s.email);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Moroccan Household Wallet</h2>
        {navItems.map(([label, to]) => (
          <NavLink key={to} className="nav-link" to={to}>{label}</NavLink>
        ))}
      </aside>
      <div className="content">
        <header className="topbar">
          <div>
            <strong>{location.pathname.split('/').filter(Boolean).join(' / ') || 'dashboard'}</strong>
          </div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <QuickAddButton />
            <NotificationBell unreadCount={unread} />
            <button className="btn btn-ghost">{email ?? 'Profile'}</button>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
