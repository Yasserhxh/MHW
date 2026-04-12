import { StatCard } from './StatCard';

export interface DashboardKpiItem {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'muted';
}

export function DashboardKpiRow({ items }: { items: DashboardKpiItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard
          key={item.id}
          label={item.label}
          value={item.value}
          hint={item.hint}
          tone={item.tone}
        />
      ))}
    </div>
  );
}
