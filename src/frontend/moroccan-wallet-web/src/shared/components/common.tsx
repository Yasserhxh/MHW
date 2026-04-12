import { Link } from 'react-router-dom';
import { CurrencyAmount } from './CurrencyAmount';
import { StatusBadge } from './StatusBadge';
import { FilterBar } from './FilterBar';

export function QuickAddButton({ to = '/expenses/new', label = 'Quick Add' }: { to?: string; label?: string }) {
  return (
    <Link
      className="inline-flex items-center justify-center rounded-2xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
      to={to}
    >
      {label}
    </Link>
  );
}
export { CurrencyAmount, StatusBadge };
export { FilterBar };
