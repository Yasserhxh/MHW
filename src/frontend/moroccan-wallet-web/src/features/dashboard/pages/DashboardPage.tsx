import { AppPageHeader } from '../../../shared/components/AppPageHeader';
import { QuickAddButton } from '../../../shared/components/common';
import { SectionCard } from '../../../shared/components/SectionCard';
import { StatCard } from '../../../shared/components/StatCard';
import { TransactionList } from '../../../shared/components/TransactionList';
import { ReminderList } from '../../../shared/components/ReminderList';

const recentTransactions = [
  { id: '1', title: 'Carrefour Market', category: 'Groceries', amount: 265, date: 'Apr 09', status: 'paid' as const },
  { id: '2', title: 'Electricity Bill', category: 'Utilities', amount: 410, date: 'Apr 12', status: 'upcoming' as const },
];

export default function DashboardPage() {
  return (
    <div className="page-grid">
      <AppPageHeader title="Dashboard" subtitle="Your household finances at a glance." action={<QuickAddButton />} />
      <div className="grid-4">
        <StatCard label="Month spent" value="MAD 4,890" tone="warning" />
        <StatCard label="Budget remaining" value="MAD 2,110" tone="success" />
        <StatCard label="Upcoming bills" value="3" tone="warning" />
        <StatCard label="Household balance" value="MAD -340" tone="danger" />
      </div>
      <div className="grid-2">
        <SectionCard title="Recent transactions"><TransactionList items={recentTransactions} /></SectionCard>
        <SectionCard title="Upcoming reminders"><ReminderList items={[{ id: '1', title: 'Internet', dueDate: 'Apr 14', status: 'upcoming' }, { id: '2', title: 'Rent split', dueDate: 'Apr 16', status: 'overdue' }]} /></SectionCard>
        <SectionCard title="Shared activity"><div className="list"><div className="list-item"><span>Youssef added Water Bill</span><span>MAD 180</span></div><div className="list-item"><span>Amina settled groceries</span><span>MAD 220</span></div></div></SectionCard>
        <SectionCard title="Grocery updates & latest notifications"><div className="list"><div className="list-item"><span>Olive oil dropped to MAD 62</span><span>Marjane</span></div><div className="list-item"><span>Reminder: Electricity due in 2 days</span><span>now</span></div></div></SectionCard>
      </div>
    </div>
  );
}
