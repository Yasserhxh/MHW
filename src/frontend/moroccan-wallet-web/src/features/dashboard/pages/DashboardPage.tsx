import { Link } from 'react-router-dom';
import {
  TrendingDown,
  Wallet,
  AlarmClock,
  Users,
  ArrowRight,
  Plus,
  ShoppingCart,
  Bell,
} from 'lucide-react';
import { StatCard } from '@/shared/components/StatCard';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { formatRelativeDate, formatDaysUntil } from '@/shared/utils/format';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSignalR } from '@/features/notifications/hooks/useSignalR';

// Placeholder data — replace with useQuery calls once backend endpoints are ready
const MOCK_TRANSACTIONS = [
  { id: '1', title: 'Marjane groceries', amount: 342.5, category: 'food', date: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: '2', title: 'Electricity bill', amount: 180, category: 'utilities', date: new Date(Date.now() - 3600000 * 26).toISOString() },
  { id: '3', title: 'Petit taxi', amount: 25, category: 'transport', date: new Date(Date.now() - 3600000 * 30).toISOString() },
  { id: '4', title: 'Pharmacie', amount: 67.8, category: 'health', date: new Date(Date.now() - 3600000 * 50).toISOString() },
];

const MOCK_REMINDERS = [
  { id: '1', title: 'Internet subscription', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), amount: 259, status: 'upcoming' },
  { id: '2', title: 'Water bill', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), amount: 145, status: 'upcoming' },
  { id: '3', title: 'Rent payment', dueDate: new Date(Date.now() - 86400000).toISOString(), amount: 4500, status: 'overdue' },
];

const MOCK_SHARED = [
  { id: '1', name: 'Fatima Z.', balance: 320 },
  { id: '2', name: 'Hassan A.', balance: -150 },
  { id: '3', name: 'Meryem K.', balance: 75 },
];

const categoryColors: Record<string, string> = {
  food: 'bg-orange-100 text-orange-700',
  utilities: 'bg-blue-100 text-blue-700',
  transport: 'bg-purple-100 text-purple-700',
  health: 'bg-green-100 text-green-700',
  housing: 'bg-amber-100 text-amber-700',
  other: 'bg-slate-100 text-slate-600',
};

export default function DashboardPage() {
  const email = useAuthStore((s) => s.email);
  const firstName = email?.split('@')[0] ?? 'there';

  // Connect SignalR for live notifications
  useSignalR();

  return (
    <div>
      <AppPageHeader
        title={`Good morning, ${firstName} 👋`}
        subtitle="Here's what's happening with your finances."
        action={
          <Link to="/expenses/new">
            <Button leftIcon={<Plus className="w-4 h-4" />} size="sm">
              Add expense
            </Button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Spent this month"
          value="MAD 3,842"
          subtitle="April 2026"
          icon={TrendingDown}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          trend={{ value: -8.2, label: 'vs last month', positive: false }}
        />
        <StatCard
          title="Budget remaining"
          value="MAD 2,158"
          subtitle="of MAD 6,000 budget"
          icon={Wallet}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
          trend={{ value: 12, label: 'better than avg', positive: true }}
        />
        <StatCard
          title="Upcoming bills"
          value="3"
          subtitle="next 7 days"
          icon={AlarmClock}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />
        <StatCard
          title="Household balance"
          value="MAD +245"
          subtitle="net owed to you"
          icon={Users}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          trend={{ value: 0, label: '2 members owe you', positive: true }}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent transactions"
              action={
                <Link to="/expenses" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />
            <div className="space-y-1">
              {MOCK_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-1 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 ${categoryColors[tx.category] ?? categoryColors.other}`}>
                    {tx.category[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{tx.title}</p>
                    <p className="text-xs text-slate-400">{formatRelativeDate(tx.date)}</p>
                  </div>
                  <CurrencyAmount amount={tx.amount} negative size="sm" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Upcoming reminders */}
          <Card>
            <CardHeader
              title="Upcoming reminders"
              action={
                <Link to="/reminders" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  All <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />
            <div className="space-y-2">
              {MOCK_REMINDERS.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlarmClock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700 truncate">{r.title}</span>
                  </div>
                  <Badge variant={r.status === 'overdue' ? 'danger' : 'warning'} size="sm">
                    {formatDaysUntil(r.dueDate)}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Household balances */}
          <Card>
            <CardHeader
              title="Household balances"
              action={
                <Link to="/shared-expenses" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  All <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />
            <div className="space-y-2">
              {MOCK_SHARED.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                      {m.name[0]}
                    </div>
                    <span className="text-sm text-slate-700">{m.name}</span>
                  </div>
                  <CurrencyAmount amount={m.balance} size="sm" positive={m.balance > 0} negative={m.balance < 0} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick links row */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/expenses', icon: TrendingDown, label: 'Expenses', color: 'text-red-500', bg: 'bg-red-50' },
          { to: '/shared-expenses', icon: Users, label: 'Shared', color: 'text-blue-500', bg: 'bg-blue-50' },
          { to: '/grocery-prices', icon: ShoppingCart, label: 'Grocery', color: 'text-orange-500', bg: 'bg-orange-50' },
          { to: '/notifications', icon: Bell, label: 'Notifications', color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map(({ to, icon: Icon, label, color, bg }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-100 shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.75} />
            </div>
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
}
