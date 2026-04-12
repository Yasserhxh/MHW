import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      to="/notifications"
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 ? (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold leading-none text-white"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
