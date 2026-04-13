import { useParams } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { useExpense } from '../hooks/useExpenses';

export default function ExpenseDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useExpense(id);

  if (isLoading) {
    return <LoadingState message="Loading transaction..." />;
  }

  if (isError || !data) {
    return <ErrorState message="Transaction not found." onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6">
      <AppPageHeader title={data.title} subtitle="Transaction detail" />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Summary">
          <div className="space-y-3">
            <CurrencyAmount amount={data.amount} size="xl" positive={data.type === 'income'} negative={data.type === 'expense'} />
            <div className="text-sm text-slate-500">
              {data.dateLabel} · {data.paymentMethodLabel}
            </div>
            {data.notes ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{data.notes}</div> : null}
          </div>
        </SectionCard>
        <SectionCard title="Metadata">
          <div className="space-y-3 text-sm text-slate-600">
            <div>Type: {data.type}</div>
            <div>Category: {data.categoryLabel}</div>
            <div>Wallet: {data.walletLabel}</div>
            <div>Recurring: {data.isRecurring ? 'Yes' : 'No'}</div>
            <div>Created at: {data.createdAt}</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
