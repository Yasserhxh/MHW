import { AppPageHeader } from '../../../shared/components/AppPageHeader';
import { FilterBar, QuickAddButton } from '../../../shared/components/common';
import { SectionCard } from '../../../shared/components/SectionCard';
import { TransactionList } from '../../../shared/components/TransactionList';

const items = [
  { id: '1', title: 'Milk & Bread', category: 'Groceries', amount: 46, date: 'Apr 10', status: 'paid' as const },
  { id: '2', title: 'Taxi', category: 'Transport', amount: 22, date: 'Apr 10', status: 'paid' as const },
  { id: '3', title: 'Phone Bill', category: 'Utilities', amount: 140, date: 'Apr 12', status: 'upcoming' as const },
];

export default function ExpensesPage() {
  return (
    <div className="page-grid">
      <AppPageHeader title="Expenses" subtitle="Track and filter personal transactions." action={<QuickAddButton to="/expenses/new" label="Add Expense" />} />
      <div className="grid-4">
        <div className="card"><strong>Today</strong><div className="stat-number">MAD 68</div></div>
        <div className="card"><strong>This week</strong><div className="stat-number">MAD 614</div></div>
        <div className="card"><strong>This month</strong><div className="stat-number">MAD 2,480</div></div>
        <div className="card"><strong>Top category</strong><div className="stat-number">Groceries</div></div>
      </div>
      <FilterBar>
        <div className="grid-4">
          <input className="input" placeholder="Search title" />
          <select className="select"><option>All categories</option></select>
          <select className="select"><option>All statuses</option></select>
          <button className="btn btn-ghost">Reset</button>
        </div>
      </FilterBar>
      <div className="grid-2">
        <SectionCard title="Transactions"><TransactionList items={items} /></SectionCard>
        <SectionCard title="Category summary"><div className="list"><div className="list-item"><span>Groceries</span><strong>MAD 1,240</strong></div><div className="list-item"><span>Utilities</span><strong>MAD 730</strong></div><div className="list-item"><span>Transport</span><strong>MAD 510</strong></div></div></SectionCard>
      </div>
    </div>
  );
}
