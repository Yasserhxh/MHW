import { CurrencyAmount, StatusBadge } from './common';

export type TransactionItem = { id: string; title: string; category: string; amount: number; date: string; status: 'paid' | 'upcoming' | 'overdue' };

export function TransactionList({ items }: { items: TransactionItem[] }) {
  return (
    <div className="list">
      {items.map((item) => (
        <article className="list-item" key={item.id}>
          <div>
            <strong>{item.title}</strong>
            <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{item.category} · {item.date}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><CurrencyAmount amount={item.amount} /></div>
            <StatusBadge status={item.status} />
          </div>
        </article>
      ))}
    </div>
  );
}
