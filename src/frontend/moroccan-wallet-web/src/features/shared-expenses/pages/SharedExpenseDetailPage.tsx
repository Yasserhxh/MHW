import { useParams } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { useSharedExpense, useSharedExpensesOverview } from '../hooks/useSharedExpenses';

export default function SharedExpenseDetailPage() {
  const { id } = useParams();
  const detail = useSharedExpense(id);
  const overview = useSharedExpensesOverview();
  if (detail.isLoading || overview.isLoading) return <LoadingState message="Loading shared expense..." />;
  if (detail.isError || overview.isError || !detail.data || !overview.data) return <ErrorState message="Shared expense not found." onRetry={() => void detail.refetch()} />;

  const payer = overview.data.members.find((member) => member.id === detail.data.paidByMemberId);

  return (
    <div className="space-y-6">
      <AppPageHeader title={detail.data.title} subtitle="Shared expense detail" />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Summary">
          <CurrencyAmount amount={detail.data.amount} size="xl" />
          <div className="mt-3 text-sm text-slate-500">{detail.data.date} · paid by {payer?.name ?? detail.data.paidByMemberId}</div>
          {detail.data.notes ? <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{detail.data.notes}</div> : null}
        </SectionCard>
        <SectionCard title="Participants">
          <div className="space-y-3">
            {detail.data.participantIds.map((participantId) => {
              const member = overview.data.members.find((item) => item.id === participantId);
              return <div key={participantId} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">{member?.name ?? participantId}</div>;
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
