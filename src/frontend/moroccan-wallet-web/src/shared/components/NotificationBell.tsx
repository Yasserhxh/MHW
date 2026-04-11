import { Link } from 'react-router-dom';

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  return (
    <Link to="/notifications" className="btn btn-ghost" aria-label="notifications">
      🔔 {unreadCount > 0 ? `(${unreadCount})` : ''}
    </Link>
  );
}
