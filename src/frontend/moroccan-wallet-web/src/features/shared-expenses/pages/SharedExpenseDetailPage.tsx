import { useParams } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { formatDate } from '@/shared/utils/format';
import { useSharedExpense, useSharedGroupOverview } from '../hooks/useSharedExpenses';

export default function SharedExpenseDetailPage() {
  const { id } = useParams();
  const detail = useSharedExpense(id);
  const overview = useSharedGroupOverview(detail.data?.groupId);

  if (detail.isLoading || (detail.data?.groupId && overview.isLoading)) {
    return <LoadingState message="Loading shared expense..." />;
  }

  if (detail.isError || !detail.data || (detail.data.groupId && overview.isError)) {
    return <ErrorState message="Shared expense not found." onRetry={() => void detail.refetch()} />;
  }

  const group = overview.data;

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={detail.data.title}
        subtitle={group ? `${group.name} / shared expense detail` : 'Shared expense detail'}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <SectionCard title="Summary">
          <CurrencyAmount amount={detail.data.amount} currency={detail.data.currency} size="xl" />
          <div className="mt-3 text-sm text-slate-500">{formatDate(detail.data.date)} / paid by {detail.data.paidByName}</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="font-semibold text-slate-900">Split</div>
              <div className="mt-1 capitalize">{detail.data.splitType}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="font-semibold text-slate-900">Status</div>
              <div className="mt-1">{detail.data.settled ? 'Fully settled' : 'Pending balances'}</div>
            </div>
          </div>
          {detail.data.notes ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{detail.data.notes}</div>
          ) : null}
        </SectionCard>

        <SectionCard title="Participants">
          <div className="space-y-3">
            {detail.data.splits.map((split) => (
              <div key={split.userId} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{split.name}</div>
                    <div className="text-xs text-slate-500">{split.isSettled ? 'Settled' : 'Still owed'}</div>
                  </div>
                  <CurrencyAmount amount={split.amount} currency={detail.data.currency} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent settlements">
        {group?.settlements.length ? (
          <div className="space-y-3">
            {group.settlements.slice(0, 5).map((settlement) => (
              <div key={settlement.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {settlement.fromName} settled with {settlement.toName}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Settled on {formatDate(settlement.settledAt)}</div>
                    {settlement.notes ? <div className="mt-2 text-sm text-slate-600">{settlement.notes}</div> : null}
                  </div>
                  <CurrencyAmount amount={settlement.amount} currency={settlement.currency} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            No settlements have been recorded for this household yet.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
