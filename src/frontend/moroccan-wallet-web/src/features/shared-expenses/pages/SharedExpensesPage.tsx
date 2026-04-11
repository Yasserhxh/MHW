import { useState } from 'react';
import { Plus, Users, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { formatDateShort } from '@/shared/utils/format';

const MOCK_MEMBERS = [
  { id: '1', name: 'Fatima Zahra', email: 'fatima@example.com', balance: 320 },
  { id: '2', name: 'Hassan Amine', email: 'hassan@example.com', balance: -150 },
  { id: '3', name: 'Meryem Kabbaj', email: 'meryem@example.com', balance: 75 },
];

const MOCK_EXPENSES = [
  { id: '1', title: 'Collective groceries', amount: 540, paidByName: 'You', date: new Date(Date.now() - 86400000).toISOString(), settled: false, participants: 3 },
  { id: '2', title: 'Electricity bill', amount: 360, paidByName: 'Fatima Zahra', date: new Date(Date.now() - 86400000 * 3).toISOString(), settled: false, participants: 3 },
  { id: '3', title: 'Internet bill', amount: 259, paidByName: 'Hassan Amine', date: new Date(Date.now() - 86400000 * 7).toISOString(), settled: true, participants: 3 },
];

export default function SharedExpensesPage() {
  const [activeTab, setActiveTab] = useState<'balances' | 'expenses' | 'settlements'>('balances');

  const netBalance = MOCK_MEMBERS.reduce((s, m) => s + m.balance, 0);

  return (
    <div>
      <AppPageHeader
        title="Shared Expenses"
        subtitle="Manage shared costs and household balances"
        action={
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Add shared expense
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Card padding="sm">
          <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">Net balance</p>
          <p className="text-2xl font-bold mt-1">
            <CurrencyAmount amount={netBalance} size="xl" positive={netBalance > 0} negative={netBalance < 0} />
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {netBalance >= 0 ? 'Overall you are owed' : 'Overall you owe'}
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">Unsettled</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">MAD 900</p>
          <p className="text-xs text-slate-400 mt-1">Across 2 expenses</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">Members</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{MOCK_MEMBERS.length}</p>
          <p className="text-xs text-slate-400 mt-1">Household members</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-5">
        {(['balances', 'expenses', 'settlements'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'balances' && (
        <div className="space-y-3">
          {MOCK_MEMBERS.map((member) => (
            <Card key={member.id} padding="sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                    {member.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <CurrencyAmount amount={Math.abs(member.balance)} size="md" />
                    <p className="text-xs text-slate-400 mt-0.5">
                      {member.balance >= 0 ? 'owes you' : 'you owe'}
                    </p>
                  </div>
                  {member.balance > 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5 text-red-500" />
                  )}
                  {member.balance !== 0 && (
                    <Button size="sm" variant="outline">
                      Settle
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'expenses' && (
        <Card padding="none">
          <div className="divide-y divide-slate-50">
            {MOCK_EXPENSES.map((expense) => (
              <div key={expense.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4.5 h-4.5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 text-sm">{expense.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Paid by {expense.paidByName} · {expense.participants} people · {formatDateShort(expense.date)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <CurrencyAmount amount={expense.amount} />
                  <div className="mt-1">
                    <Badge variant={expense.settled ? 'success' : 'warning'} dot>
                      {expense.settled ? 'Settled' : 'Unsettled'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'settlements' && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-green-400" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-slate-700">No settlements yet</p>
          <p className="text-sm text-slate-400 mt-1">Settlement history will appear here.</p>
        </div>
      )}
    </div>
  );
}
