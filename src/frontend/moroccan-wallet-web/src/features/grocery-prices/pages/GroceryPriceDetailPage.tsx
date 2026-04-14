import { useState } from 'react';
import { Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { Button } from '@/shared/components/ui/Button';
import { formatDate } from '@/shared/utils/format';
import { normalizeApiError } from '@/shared/utils/error';
import { useGroceryPrice, useToggleFavoriteProduct } from '../hooks/useGroceryPrices';

export default function GroceryPriceDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useGroceryPrice(id);
  const toggleFavorite = useToggleFavoriteProduct();
  const [favoriteError, setFavoriteError] = useState('');

  if (isLoading) return <LoadingState message="Loading product history..." />;
  if (isError || !data) return <ErrorState message="Product not found." onRetry={() => void refetch()} />;

  const latestHistory = data.history[0];

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={data.name}
        subtitle={`${data.category || 'Uncategorized'} / ${data.unit || 'Unit'}`}
        action={
          <Button
            variant="outline"
            loading={toggleFavorite.isPending}
            onClick={async () => {
              setFavoriteError('');
              try {
                await toggleFavorite.mutateAsync({ productId: data.id, isFavorite: data.isFavorite });
              } catch (error) {
                setFavoriteError(normalizeApiError(error).message);
              }
            }}
          >
            <Star className={`h-4 w-4 ${data.isFavorite ? 'fill-current text-amber-500' : 'text-slate-400'}`} />
            {data.isFavorite ? 'Unfavorite' : 'Favorite'}
          </Button>
        }
      />

      {favoriteError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{favoriteError}</div> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Latest price">
          {data.latestPrice !== null ? (
            <>
              <CurrencyAmount amount={data.latestPrice} currency={data.latestCurrency ?? 'MAD'} size="xl" />
              <div className="mt-3 text-sm text-slate-500">
                {data.lastUpdated ? `Recorded ${formatDate(data.lastUpdated)}` : 'Latest record date unavailable'}
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-500">No price entries recorded yet.</div>
          )}
        </SectionCard>

        <SectionCard title="Cheapest recent">
          {data.cheapestRecentPrice !== null ? (
            <CurrencyAmount amount={data.cheapestRecentPrice} currency={data.latestCurrency ?? 'MAD'} size="xl" />
          ) : (
            <div className="text-sm text-slate-500">No history yet.</div>
          )}
        </SectionCard>

        <SectionCard title="Latest store">
          <div className="text-sm font-semibold text-slate-900">{latestHistory?.storeName || 'Unknown store'}</div>
          <div className="mt-2 text-sm text-slate-500">
            {latestHistory?.recordedAt ? `Seen on ${formatDate(latestHistory.recordedAt)}` : 'No recent store data'}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Price history">
        {data.history.length ? (
          <div className="space-y-3">
            {data.history.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{entry.storeName || 'Unknown store'}</div>
                    <div className="mt-1 text-sm text-slate-500">{formatDate(entry.recordedAt)}</div>
                  </div>
                  <CurrencyAmount amount={entry.price} currency={entry.currency} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            No price history has been recorded for this product yet.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
