import { useParams } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { useGroceryPrice, useGroceryPrices } from '../hooks/useGroceryPrices';

export default function GroceryPriceDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useGroceryPrice(id);
  const prices = useGroceryPrices();

  if (isLoading) return <LoadingState message="Loading price detail..." />;
  if (isError || !data) return <ErrorState message="Price entry not found." onRetry={() => void refetch()} />;

  const history = (prices.data ?? []).filter((entry) => entry.productName === data.productName).slice(0, 6);

  return (
    <div className="space-y-6">
      <AppPageHeader title={data.productName} subtitle={`${data.storeName} · ${data.unit}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Latest price">
          <CurrencyAmount amount={data.price} size="xl" />
        </SectionCard>
        <SectionCard title="Recent history">
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">{entry.storeName}</div>
                <div className="mt-1 text-sm text-slate-500">{entry.date}</div>
                <CurrencyAmount amount={entry.price} className="mt-2" />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
