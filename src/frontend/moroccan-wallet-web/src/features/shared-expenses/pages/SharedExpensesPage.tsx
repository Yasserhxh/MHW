import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { QuickAddButton } from '@/shared/components/common';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useForm } from 'react-hook-form';
import { useAddSharedExpense, useSharedExpensesOverview } from '../hooks/useSharedExpenses';

type SharedExpenseForm = {
  title: string;
  amount: number;
  categoryId: string;
  paidByMemberId: string;
  participantIds: string[];
  date: string;
  notes?: string;
};

export default function SharedExpensesPage() {
  const { data, isLoading, isError, refetch } = useSharedExpensesOverview();
  const addExpense = useAddSharedExpense();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit } = useForm<SharedExpenseForm>({ defaultValues: { title: '', amount: 0, categoryId: 'cat-groceries', paidByMemberId: 'member-1', participantIds: ['member-1', 'member-2', 'member-3'], date: new Date().toISOString().slice(0, 10), notes: '' } });

  if (isLoading) return <LoadingState message="Loading household balances..." />;
  if (isError || !data) return <ErrorState message="Could not load shared expenses." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader title="Shared expenses" subtitle="Keep household costs transparent and make balances easy to understand." action={<QuickAddButton label="Add shared expense" to="/shared-expenses/new" />} />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Member balances">
          <div className="space-y-3">
            {data.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                  <div className="text-sm text-slate-500">{member.role}</div>
                </div>
                <CurrencyAmount amount={member.balance} positive={member.balance > 0} negative={member.balance < 0} />
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Settlement history">
          <div className="space-y-3">
            {data.settlements.map((settlement) => (
              <div key={settlement.id} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                <div className="font-semibold text-slate-900">{settlement.fromMemberId} settled with {settlement.toMemberId}</div>
                <div className="mt-1">{settlement.date}</div>
                <CurrencyAmount amount={settlement.amount} className="mt-2" />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Household expenses" action={<Button size="sm" onClick={() => setOpen(true)}>Quick add</Button>}>
        <div className="space-y-3">
          {data.sharedExpenses.map((expense) => (
            <Link key={expense.id} to={`/shared-expenses/${expense.id}`} className="block rounded-2xl border border-slate-200 p-4 hover:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{expense.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{expense.date} · paid by {expense.paidByMemberId}</div>
                </div>
                <CurrencyAmount amount={expense.amount} />
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
      <Drawer open={open} onClose={() => setOpen(false)} title="Add shared expense" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button form="shared-form" type="submit" loading={addExpense.isPending}>Save</Button></>}>
        <form id="shared-form" className="space-y-4" onSubmit={handleSubmit(async (values) => { await addExpense.mutateAsync(values); setOpen(false); })}>
          <Input label="Title" {...register('title')} />
          <Input label="Amount" type="number" {...register('amount', { valueAsNumber: true })} />
          <Input label="Date" type="date" {...register('date')} />
        </form>
      </Drawer>
    </div>
  );
}
