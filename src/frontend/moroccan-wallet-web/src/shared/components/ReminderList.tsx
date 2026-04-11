import { StatusBadge } from './common';

export type ReminderItem = { id: string; title: string; dueDate: string; status: 'upcoming' | 'overdue' | 'paid' };

export function ReminderList({ items }: { items: ReminderItem[] }) {
  return (
    <div className="list">
      {items.map((item) => (
        <div key={item.id} className="list-item">
          <div>
            <strong>{item.title}</strong>
            <div style={{ color: 'var(--muted)', fontSize: '.86rem' }}>{item.dueDate}</div>
          </div>
          <StatusBadge status={item.status} />
        </div>
      ))}
    </div>
  );
}
