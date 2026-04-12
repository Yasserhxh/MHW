import { useParams } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { getMockDb } from '@/shared/mocks/mockDb';
import { ErrorState } from '@/shared/components/ErrorState';

export default function ExpenseDetailPage() {
  const { id } = useParams();
  const db = getMockDb();
  const tx = db.transactions.find((item) => item.id === id);
  if (!tx) return <ErrorState message="Transaction not found." />;
  const category = db.categories.find((item) => item.id === tx.categoryId);
  const wallet = db.wallets.find((item) => item.id === tx.walletId);

  return (
    <div className="space-y-6">
      <AppPageHeader title={tx.title} subtitle="Transaction detail" />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Summary">
          <div className="space-y-3">
            <CurrencyAmount amount={tx.amount} size="xl" positive={tx.type === 'income'} negative={tx.type === 'expense'} />
            <div className="text-sm text-slate-500">{tx.date} · {tx.paymentMethod}</div>
            {tx.notes ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{tx.notes}</div> : null}
          </div>
        </SectionCard>
        <SectionCard title="Metadata">
          <div className="space-y-3 text-sm text-slate-600">
            <div>Type: {tx.type}</div>
            <div>Category: {category?.name ?? 'Unknown'}</div>
            <div>Wallet: {wallet?.name ?? 'Unknown'}</div>
            <div>Created at: {tx.createdAt}</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
