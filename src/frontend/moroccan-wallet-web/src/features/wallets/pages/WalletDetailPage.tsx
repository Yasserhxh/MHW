import { useMemo, useState } from 'react';
import { Archive, PencilLine } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Button } from '@/shared/components/ui/Button';
import { normalizeApiError } from '@/shared/utils/error';
import { formatDate } from '@/shared/utils/format';
import { WalletFormDrawer } from '../components/WalletFormDrawer';
import { useArchiveWallet, useSaveWallet, useWallet } from '../hooks/useWallets';
import { useExpensesSnapshot } from '@/features/expenses/hooks/useExpenses';

function formatWalletType(type: string) {
  if (type === 'shared-household') {
    return 'Shared household';
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function WalletDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setEditing] = useState(false);
  const [formError, setFormError] = useState('');
  const [archiveError, setArchiveError] = useState('');
  const { data, isLoading, isError, refetch } = useWallet(id);
  const saveWallet = useSaveWallet();
  const archiveWallet = useArchiveWallet();
  const expenses = useExpensesSnapshot({
    search: '',
    dateRange: 'last-90-days',
    type: 'all',
    category: 'all',
    walletId: 'all',
    paymentMethodId: 'all',
  });

  const transactions = useMemo(
    () => (expenses.data?.transactions ?? []).filter((tx) => tx.walletId === data?.id).slice(0, 6),
    [data?.id, expenses.data?.transactions]
  );

  if (isLoading) return <LoadingState message="Loading wallet..." />;
  if (isError || !data) return <ErrorState message="Wallet not found." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={data.name}
        subtitle={`A ${formatWalletType(data.type)} wallet with ${data.transactionCount} linked transactions.`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<PencilLine className="h-4 w-4" />} onClick={() => setEditing(true)}>
              Edit
            </Button>
            {!data.isArchived ? (
              <Button
                variant="ghost"
                leftIcon={<Archive className="h-4 w-4" />}
                loading={archiveWallet.isPending}
                onClick={async () => {
                  setArchiveError('');
                  try {
                    await archiveWallet.mutateAsync(data);
                    navigate('/wallets');
                  } catch (error) {
                    setArchiveError(normalizeApiError(error).message);
                  }
                }}
              >
                Archive
              </Button>
            ) : null}
          </div>
        }
      />

      {archiveError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{archiveError}</div> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Wallet summary">
          <div className="space-y-4">
            <CurrencyAmount amount={data.balance} size="xl" />
            <div className="flex flex-wrap gap-2">
              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{formatWalletType(data.type)}</div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{data.currency}</div>
              {data.isArchived ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Archived</span>
              ) : null}
            </div>
            <div className="text-sm text-slate-500">{data.transactionCount} transactions currently linked to this wallet.</div>
          </div>
        </SectionCard>

        <SectionCard title="Recent activity">
          <div className="space-y-3">
            {expenses.isLoading ? (
              <LoadingState message="Loading recent transactions..." />
            ) : transactions.length ? (
              transactions.map((tx) => (
                <div key={tx.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900">{tx.title}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {formatDate(tx.date)} · {tx.paymentMethodLabel}
                  </div>
                  <CurrencyAmount amount={tx.amount} className="mt-2" positive={tx.type === 'income'} negative={tx.type === 'expense'} />
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                No recent transactions are linked to this wallet yet.
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <WalletFormDrawer
        open={isEditing}
        initialWallet={data}
        title="Edit wallet"
        submitLabel="Save changes"
        errorMessage={formError}
        submitting={saveWallet.isPending}
        onClose={() => {
          setFormError('');
          setEditing(false);
        }}
        onSubmit={async (values) => {
          setFormError('');
          try {
            await saveWallet.mutateAsync({ id: data.id, payload: values });
            await refetch();
          } catch (error) {
            setFormError(normalizeApiError(error).message);
            throw error;
          }
        }}
      />
    </div>
  );
}
