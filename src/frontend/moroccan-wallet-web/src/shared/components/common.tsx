import { Link } from 'react-router-dom';

export function QuickAddButton({ to = '/expenses/new', label = 'Quick Add' }: { to?: string; label?: string }) {
  return <Link className="btn btn-primary" to={to}>{label}</Link>;
}

export function CurrencyAmount({ amount }: { amount: number }) {
  return <span>{new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)}</span>;
}

export function StatusBadge({ status }: { status: 'paid' | 'overdue' | 'upcoming' | 'unread' | 'read' | 'settled' }) {
  const tone = status === 'paid' || status === 'read' || status === 'settled' ? 'success' : status === 'overdue' ? 'danger' : status === 'upcoming' || status === 'unread' ? 'warning' : 'muted';
  return <span className={`badge badge-${tone}`}>{status}</span>;
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="card" style={{ display: 'grid', gap: '.6rem' }}>{children}</div>;
}
