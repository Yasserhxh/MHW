import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { FilterBar } from '@/shared/components/FilterBar';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Button } from '@/shared/components/ui/Button';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { useForm } from 'react-hook-form';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { useGroceryPrices, useSaveGroceryPrice } from '../hooks/useGroceryPrices';

export default function GroceryPricesPage() {
  const { data, isLoading, isError, refetch } = useGroceryPrices();
  const savePrice = useSaveGroceryPrice();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const { register, handleSubmit } = useForm({ defaultValues: { productName: '', storeName: '', price: 0, unit: '1 unit', date: new Date().toISOString().slice(0, 10), notes: '', isFavorite: false } });

  const filtered = useMemo(() => (data ?? []).filter((item) => item.productName.toLowerCase().includes(search.toLowerCase())), [data, search]);

  if (isLoading) return <LoadingState message="Loading price memory..." />;
  if (isError || !data) return <ErrorState message="Could not load grocery prices." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader title="Grocery prices" subtitle="Remember recent prices and spot better deals faster." action={<Button onClick={() => setOpen(true)}>Add price</Button>} />
      <FilterBar><Input placeholder="Search product" value={search} onChange={(event) => setSearch(event.target.value)} /></FilterBar>
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Favorites">
          <div className="space-y-3">
            {filtered.filter((item) => item.isFavorite).map((item) => (
              <Link key={item.id} to={`/grocery-prices/${item.id}`} className="block rounded-2xl border border-slate-200 p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="text-sm font-semibold text-slate-900">{item.productName}</div><div className="mt-1 text-sm text-slate-500">{item.storeName} · {item.unit}</div></div>
                  <CurrencyAmount amount={item.price} />
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Recent updates">
          <div className="space-y-3">
            {filtered.slice(0, 8).map((item) => (
              <Link key={item.id} to={`/grocery-prices/${item.id}`} className="block rounded-2xl border border-slate-200 p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="text-sm font-semibold text-slate-900">{item.productName}</div><div className="mt-1 text-sm text-slate-500">{item.date} · {item.storeName}</div></div>
                  <CurrencyAmount amount={item.price} />
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} title="Add price entry" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button form="grocery-form" type="submit" loading={savePrice.isPending}>Save</Button></>}>
        <form id="grocery-form" className="space-y-4" onSubmit={handleSubmit(async (values) => { await savePrice.mutateAsync({ payload: values }); setOpen(false); })}>
          <Input label="Product" {...register('productName')} />
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Store" {...register('storeName')} /><Input label="Price" type="number" {...register('price', { valueAsNumber: true })} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Unit" {...register('unit')} /><Input label="Date" type="date" {...register('date')} /></div>
        </form>
      </Drawer>
    </div>
  );
}
