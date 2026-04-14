import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { FilterBar } from '@/shared/components/FilterBar';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/Button';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { formatDate } from '@/shared/utils/format';
import { normalizeApiError } from '@/shared/utils/error';
import { useGroceryPrices, useSaveGroceryPrice, useToggleFavoriteProduct } from '../hooks/useGroceryPrices';
import type { AddPriceRequest } from '../types/grocery-prices.types';

type GroceryFormValues = {
  productId: string;
  productName: string;
  productCategory: string;
  productUnit: string;
  storeName: string;
  price: number;
  currency: string;
  date: string;
  notes: string;
};

export default function GroceryPricesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [favoriteError, setFavoriteError] = useState('');

  const { data, isLoading, isError, refetch } = useGroceryPrices({ search, category, favoritesOnly });
  const savePrice = useSaveGroceryPrice();
  const toggleFavorite = useToggleFavoriteProduct();

  const { register, handleSubmit, reset, watch, setValue } = useForm<GroceryFormValues>({
    defaultValues: {
      productId: '',
      productName: '',
      productCategory: '',
      productUnit: '1 unit',
      storeName: '',
      price: 0,
      currency: 'MAD',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  const selectedProductId = watch('productId');
  const products = useMemo(() => data ?? [], [data]);
  const allCategories = useMemo(() => Array.from(new Set(products.map((item) => item.category).filter(Boolean))).sort(), [products]);
  const favoriteProducts = products.filter((item) => item.isFavorite);

  const resetForm = () => {
    reset({
      productId: '',
      productName: '',
      productCategory: '',
      productUnit: '1 unit',
      storeName: '',
      price: 0,
      currency: 'MAD',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
  };

  if (isLoading) return <LoadingState message="Loading grocery products..." />;
  if (isError || !data) return <ErrorState message="Could not load grocery prices." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Grocery prices"
        subtitle="Track products, remember recent prices, and keep favorite staples easy to monitor."
        action={
          <Button
            onClick={() => {
              setSaveError('');
              resetForm();
              setOpen(true);
            }}
          >
            Add price
          </Button>
        }
      />

      <FilterBar className="grid gap-3 md:grid-cols-[1.6fr,1fr,auto]">
        <Input
          placeholder="Search products"
          value={search}
          leftIcon={<Search className="h-4 w-4" />}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Input placeholder="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} list="grocery-categories" />
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={favoritesOnly}
            onChange={(event) => setFavoritesOnly(event.target.checked)}
          />
          Favorites only
        </label>
        <datalist id="grocery-categories">
          {allCategories.map((item) => (
            <option key={item} value={item!} />
          ))}
        </datalist>
      </FilterBar>

      {favoriteError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{favoriteError}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <SectionCard title="Favorite products">
          {favoriteProducts.length ? (
            <div className="space-y-3">
              {favoriteProducts.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/grocery-prices/${item.id}`} className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {item.category || 'Uncategorized'} / {item.unit || 'Unit'}
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={toggleFavorite.isPending}
                      onClick={async () => {
                        setFavoriteError('');
                        try {
                          await toggleFavorite.mutateAsync({ productId: item.id, isFavorite: item.isFavorite });
                        } catch (error) {
                          setFavoriteError(normalizeApiError(error).message);
                        }
                      }}
                    >
                      <Star className="h-4 w-4 fill-current text-amber-500" />
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">{item.lastUpdated ? `Updated ${formatDate(item.lastUpdated)}` : 'No entries yet'}</div>
                    {item.latestPrice !== null ? (
                      <CurrencyAmount amount={item.latestPrice} currency={item.latestCurrency ?? 'MAD'} />
                    ) : (
                      <span className="text-sm text-slate-500">No price yet</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Star}
              title="No favorite products yet"
              description="Star your most-watched products to keep them pinned here."
            />
          )}
        </SectionCard>

        <SectionCard title="Products">
          {products.length ? (
            <div className="space-y-3">
              {products.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/grocery-prices/${item.id}`} className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {item.category || 'Uncategorized'} / {item.unit || 'Unit'}
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        {item.latestStoreName ? `${item.latestStoreName} / ` : ''}
                        {item.lastUpdated ? `updated ${formatDate(item.lastUpdated)}` : 'No price entries yet'}
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={toggleFavorite.isPending}
                      onClick={async () => {
                        setFavoriteError('');
                        try {
                          await toggleFavorite.mutateAsync({ productId: item.id, isFavorite: item.isFavorite });
                        } catch (error) {
                          setFavoriteError(normalizeApiError(error).message);
                        }
                      }}
                    >
                      <Star className={`h-4 w-4 ${item.isFavorite ? 'fill-current text-amber-500' : 'text-slate-400'}`} />
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Latest</div>
                      {item.latestPrice !== null ? (
                        <CurrencyAmount amount={item.latestPrice} currency={item.latestCurrency ?? 'MAD'} className="mt-2" />
                      ) : (
                        <div className="mt-2 text-sm text-slate-500">No price yet</div>
                      )}
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Cheapest recent</div>
                      {item.cheapestRecentPrice !== null ? (
                        <CurrencyAmount amount={item.cheapestRecentPrice} currency={item.latestCurrency ?? 'MAD'} className="mt-2" />
                      ) : (
                        <div className="mt-2 text-sm text-slate-500">Not enough history</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No grocery products yet"
              description="Add your first price entry to start building your grocery memory."
              action={{ label: 'Add price', onClick: () => setOpen(true) }}
            />
          )}
        </SectionCard>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add price entry"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button form="grocery-form" type="submit" loading={savePrice.isPending}>
              Save
            </Button>
          </>
        }
      >
        <form
          id="grocery-form"
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            setSaveError('');
            const payload: AddPriceRequest = {
              productId: values.productId || undefined,
              productName: values.productName,
              productCategory: values.productCategory || undefined,
              productUnit: values.productUnit || undefined,
              storeName: values.storeName || undefined,
              price: values.price,
              currency: values.currency,
              date: values.date,
              notes: values.notes || undefined,
            };

            try {
              await savePrice.mutateAsync({ payload });
              setOpen(false);
              resetForm();
            } catch (error) {
              setSaveError(normalizeApiError(error).message);
            }
          })}
        >
          {saveError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{saveError}</div> : null}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Existing product</label>
            <select
              className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              {...register('productId')}
              onChange={(event) => {
                const product = products.find((item) => item.id === event.target.value);
                setValue('productId', event.target.value);
                setValue('productName', product?.name ?? '');
                setValue('productCategory', product?.category ?? '');
                setValue('productUnit', product?.unit ?? '1 unit');
              }}
            >
              <option value="">Create a new product</option>
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <Input label="Product name" disabled={Boolean(selectedProductId)} {...register('productName', { required: true })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Category" disabled={Boolean(selectedProductId)} {...register('productCategory')} />
            <Input label="Unit" disabled={Boolean(selectedProductId)} {...register('productUnit')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Store" {...register('storeName')} />
            <Input label="Price" type="number" step="0.01" {...register('price', { valueAsNumber: true, required: true })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Currency" {...register('currency', { required: true })} />
            <Input label="Recorded on" type="date" {...register('date', { required: true })} />
          </div>
          <Input label="Notes" {...register('notes')} />
        </form>
      </Drawer>
    </div>
  );
}
