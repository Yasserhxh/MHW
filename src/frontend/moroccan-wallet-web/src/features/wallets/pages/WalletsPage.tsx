import { useState } from 'react';
import { Wallet2 } from 'lucide-react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { EmptyState } from '@/shared/components/EmptyState';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useForm } from 'react-hook-form';
import { useSaveWallet, useWallets } from '../hooks/useWallets';
import type { WalletPayload, WalletView } from '../types/wallets.types';
import { Link } from 'react-router-dom';

export default function WalletsPage() {
  const { data, isLoading, isError, refetch } = useWallets();
  const saveWallet = useSaveWallet();
  const [editing, setEditing] = useState<WalletView | null>(null);
  const { register, handleSubmit, reset } = useForm<WalletPayload>({
    defaultValues: { name: '', type: 'bank', currency: 'MAD', balance: 0, color: 'teal', icon: 'wallet' },
  });

  if (isLoading) return <LoadingState message="Loading wallets..." />;
  if (isError || !data) return <ErrorState message="Could not load wallets." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader title="Wallets" subtitle="Track the places where your money lives." action={<Button onClick={() => { setEditing({ id: '', name: '', type: 'bank', currency: 'MAD', balance: 0, color: 'teal', icon: 'wallet', transactionCount: 0 }); reset({ name: '', type: 'bank', currency: 'MAD', balance: 0, color: 'teal', icon: 'wallet' }); }}>Add wallet</Button>} />
      {data.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((wallet) => (
            <SectionCard
              key={wallet.id}
              title={wallet.name}
              action={<Link className="text-sm font-medium text-teal-700" to={`/wallets/${wallet.id}`}>Details</Link>}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">{wallet.type}</div>
                  <CurrencyAmount amount={wallet.balance} size="lg" />
                </div>
                <div className="text-sm text-slate-500">{wallet.transactionCount} transactions linked</div>
                <Button variant="outline" size="sm" onClick={() => { setEditing(wallet); reset(wallet); }}>Edit wallet</Button>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState icon={Wallet2} title="No wallets yet" description="Create your first wallet to organize balances and transactions." action={{ label: 'Create wallet', onClick: () => setEditing({ id: '', name: '', type: 'bank', currency: 'MAD', balance: 0, color: 'teal', icon: 'wallet', transactionCount: 0 }) }} />
      )}

      <Drawer open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? 'Edit wallet' : 'Add wallet'} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button form="wallet-form" type="submit" loading={saveWallet.isPending}>Save wallet</Button></>}>
        <form
          id="wallet-form"
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            await saveWallet.mutateAsync({ id: editing?.id || undefined, payload: values });
            setEditing(null);
          })}
        >
          <Input label="Wallet name" {...register('name')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Type</label><select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('type')}><option value="bank">Bank</option><option value="cash">Cash</option><option value="shared-household">Shared household</option><option value="savings">Savings</option></select></div>
            <Input label="Balance" type="number" {...register('balance', { valueAsNumber: true })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Currency" {...register('currency')} />
            <Input label="Color token" {...register('color')} />
          </div>
        </form>
      </Drawer>
    </div>
  );
}
