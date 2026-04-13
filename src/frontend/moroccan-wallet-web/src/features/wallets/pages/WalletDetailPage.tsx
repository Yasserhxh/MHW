import { useParams } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { useWallet } from '../hooks/useWallets';
import { useExpensesSnapshot } from '@/features/expenses/hooks/useExpenses';

export default function WalletDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useWallet(id);
  const expenses = useExpensesSnapshot();

  if (isLoading) return <LoadingState message="Loading wallet..." />;
  if (isError || !data) return <ErrorState message="Wallet not found." onRetry={() => void refetch()} />;

  const transactions = (expenses.data?.transactions ?? []).filter((tx) => tx.walletId === data.id).slice(0, 6);

  return (
    <div className="space-y-6">
      <AppPageHeader title={data.name} subtitle={`A ${data.type} wallet with ${data.transactionCount} linked transactions.`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Balance">
          <CurrencyAmount amount={data.balance} size="xl" />
        </SectionCard>
        <SectionCard title="Recent activity">
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">{tx.title}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {tx.dateLabel} · {tx.paymentMethodLabel}
                </div>
                <CurrencyAmount amount={tx.amount} className="mt-2" positive={tx.type === 'income'} negative={tx.type === 'expense'} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
