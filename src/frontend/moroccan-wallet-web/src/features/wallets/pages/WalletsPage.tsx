import { useState } from 'react';
import { Archive, Wallet2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/Button';
import { normalizeApiError } from '@/shared/utils/error';
import { WalletFormDrawer } from '../components/WalletFormDrawer';
import { useArchiveWallet, useSaveWallet, useWallets } from '../hooks/useWallets';
import type { WalletView } from '../types/wallets.types';

function formatWalletType(type: WalletView['type']) {
  if (type === 'shared-household') {
    return 'Shared household';
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function WalletsPage() {
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<WalletView | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [archiveError, setArchiveError] = useState('');
  const { data, isLoading, isError, refetch } = useWallets(showArchived);
  const saveWallet = useSaveWallet();
  const archiveWallet = useArchiveWallet();

  if (isLoading) return <LoadingState message="Loading wallets..." />;
  if (isError || !data) return <ErrorState message="Could not load wallets." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Wallets"
        subtitle="Track the places where your money lives and keep transaction balances grounded in real accounts."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowArchived((current) => !current)}>
              {showArchived ? 'Hide archived' : 'Show archived'}
            </Button>
            <Button
              onClick={() => {
                setSubmitError('');
                setEditing({
                  id: '',
                  name: '',
                  type: 'bank',
                  currency: 'MAD',
                  balance: 0,
                  color: 'teal',
                  icon: 'wallet',
                  transactionCount: 0,
                  isArchived: false,
                });
              }}
            >
              Add wallet
            </Button>
          </div>
        }
      />

      {archiveError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{archiveError}</div> : null}

      {data.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((wallet) => (
            <SectionCard
              key={wallet.id}
              title={wallet.name}
              action={<Link className="text-sm font-medium text-teal-700" to={`/wallets/${wallet.id}`}>Details</Link>}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-500">{formatWalletType(wallet.type)}</span>
                    {wallet.isArchived ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Archived</span>
                    ) : null}
                  </div>
                  <CurrencyAmount amount={wallet.balance} size="lg" />
                </div>
                <div className="text-sm text-slate-500">
                  {wallet.currency} · {wallet.transactionCount} transactions linked
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitError('');
                      setEditing(wallet);
                    }}
                  >
                    Edit wallet
                  </Button>
                  {!wallet.isArchived ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Archive className="h-4 w-4" />}
                      loading={archiveWallet.isPending}
                      onClick={async () => {
                        setArchiveError('');
                        try {
                          await archiveWallet.mutateAsync(wallet);
                        } catch (error) {
                          setArchiveError(normalizeApiError(error).message);
                        }
                      }}
                    >
                      Archive
                    </Button>
                  ) : null}
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Wallet2}
          title="No wallets yet"
          description="Create your first wallet to organize balances and transactions."
          action={{
            label: 'Create wallet',
            onClick: () =>
              setEditing({
                id: '',
                name: '',
                type: 'bank',
                currency: 'MAD',
                balance: 0,
                color: 'teal',
                icon: 'wallet',
                transactionCount: 0,
                isArchived: false,
              }),
          }}
        />
      )}

      <WalletFormDrawer
        open={Boolean(editing)}
        initialWallet={editing}
        title={editing?.id ? 'Edit wallet' : 'Add wallet'}
        submitLabel={editing?.id ? 'Save changes' : 'Save wallet'}
        errorMessage={submitError}
        submitting={saveWallet.isPending}
        onClose={() => {
          setSubmitError('');
          setEditing(null);
        }}
        onSubmit={async (values) => {
          setSubmitError('');
          try {
            await saveWallet.mutateAsync({ id: editing?.id || undefined, payload: values });
          } catch (error) {
            setSubmitError(normalizeApiError(error).message);
            throw error;
          }
        }}
      />
    </div>
  );
}
