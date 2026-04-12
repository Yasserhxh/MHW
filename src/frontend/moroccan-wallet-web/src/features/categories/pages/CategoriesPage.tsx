import { useState } from 'react';
import { Tags } from 'lucide-react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useForm } from 'react-hook-form';
import { useCategories, useSaveCategory } from '../hooks/useCategories';
import type { CategoryPayload } from '../api/categories.api';

export default function CategoriesPage() {
  const { data, isLoading, isError, refetch } = useCategories();
  const saveCategory = useSaveCategory();
  const [editing, setEditing] = useState<(CategoryPayload & { id?: string }) | null>(null);
  const { register, handleSubmit, reset } = useForm<CategoryPayload>({ defaultValues: { name: '', type: 'expense', color: 'teal', icon: 'tag' } });

  if (isLoading) return <LoadingState message="Loading categories..." />;
  if (isError || !data) return <ErrorState message="Could not load categories." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader title="Categories" subtitle="Manage default and custom categories for expenses and income." action={<Button onClick={() => { setEditing({}); reset({ name: '', type: 'expense', color: 'teal', icon: 'tag' }); }}>Add category</Button>} />
      {data.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((category) => (
            <SectionCard key={category.id} title={category.name} action={<span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{category.type}</span>}>
              <div className="space-y-3 text-sm text-slate-600">
                <div>{category.usageCount} transactions linked</div>
                <div>Total tracked amount: {category.totalAmount.toFixed(2)} MAD</div>
                <Button variant="outline" size="sm" onClick={() => { setEditing(category); reset(category); }}>Edit</Button>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState icon={Tags} title="No categories yet" description="Create categories to keep your expenses organized." action={{ label: 'Create category', onClick: () => setEditing({}) }} />
      )}
      <Drawer open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? 'Edit category' : 'Add category'} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button form="category-form" type="submit" loading={saveCategory.isPending}>Save category</Button></>}>
        <form id="category-form" className="space-y-4" onSubmit={handleSubmit(async (values) => { await saveCategory.mutateAsync({ id: editing?.id, payload: values }); setEditing(null); })}>
          <Input label="Category name" {...register('name')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Type</label><select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('type')}><option value="expense">Expense</option><option value="income">Income</option></select></div>
            <Input label="Color token" {...register('color')} />
          </div>
          <Input label="Icon token" {...register('icon')} />
        </form>
      </Drawer>
    </div>
  );
}
