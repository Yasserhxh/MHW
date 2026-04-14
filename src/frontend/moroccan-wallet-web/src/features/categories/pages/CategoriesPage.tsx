import { useMemo, useState } from 'react';
import { Tags, Trash2 } from 'lucide-react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { normalizeApiError } from '@/shared/utils/error';
import { formatCurrency } from '@/shared/utils/format';
import { CategoryFormDrawer } from '../components/CategoryFormDrawer';
import { useCategories, useDeleteCategory, useSaveCategory } from '../hooks/useCategories';
import type { CategoryView } from '../types/categories.types';

function formatCategoryType(type: CategoryView['type']) {
  return type === 'income' ? 'Income' : 'Expense';
}

export default function CategoriesPage() {
  const { data, isLoading, isError, refetch } = useCategories();
  const saveCategory = useSaveCategory();
  const deleteCategory = useDeleteCategory();
  const [editing, setEditing] = useState<CategoryView | null>(null);
  const [deleting, setDeleting] = useState<CategoryView | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const grouped = useMemo(() => {
    const categories = data ?? [];
    return {
      expense: categories.filter((category) => category.type === 'expense'),
      income: categories.filter((category) => category.type === 'income'),
    };
  }, [data]);

  if (isLoading) return <LoadingState message="Loading categories..." />;
  if (isError || !data) return <ErrorState message="Could not load categories." onRetry={() => void refetch()} />;

  const allCategories = [...grouped.expense, ...grouped.income];

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Categories"
        subtitle="Manage default and custom categories for expenses and income."
        action={
          <Button
            onClick={() => {
              setSubmitError('');
              setEditing({
                id: '',
                name: '',
                type: 'expense',
                color: '#0f766e',
                icon: 'tag',
                isDefault: false,
                usageCount: 0,
                totalAmount: 0,
              });
            }}
          >
            Add category
          </Button>
        }
      />

      {allCategories.length ? (
        <div className="space-y-6">
          {(['expense', 'income'] as const).map((type) => {
            const items = grouped[type];
            if (!items.length) {
              return null;
            }

            return (
              <SectionCard key={type} title={`${formatCategoryType(type)} categories`}>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((category) => (
                    <article key={category.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: category.color }}
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">{category.name}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span>{formatCategoryType(category.type)}</span>
                              <span>•</span>
                              <span>{category.icon}</span>
                              {category.isDefault ? (
                                <>
                                  <span>•</span>
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">Default</span>
                                </>
                              ) : (
                                <>
                                  <span>•</span>
                                  <span className="rounded-full bg-teal-50 px-2 py-0.5 font-medium text-teal-700">Custom</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div>{category.usageCount} transactions linked</div>
                        <div>Total tracked amount: {formatCurrency(category.totalAmount)}</div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSubmitError('');
                            setEditing(category);
                          }}
                        >
                          Edit
                        </Button>
                        {!category.isDefault ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 className="h-4 w-4" />}
                            onClick={() => {
                              setDeleteError('');
                              setDeleting(category);
                            }}
                          >
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </SectionCard>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Create categories to keep your expenses and income organized."
          action={{
            label: 'Create category',
            onClick: () =>
              setEditing({
                id: '',
                name: '',
                type: 'expense',
                color: '#0f766e',
                icon: 'tag',
                isDefault: false,
                usageCount: 0,
                totalAmount: 0,
              }),
          }}
        />
      )}

      <CategoryFormDrawer
        open={Boolean(editing)}
        initialCategory={editing}
        title={editing?.id ? 'Edit category' : 'Add category'}
        submitLabel={editing?.id ? 'Save changes' : 'Save category'}
        errorMessage={submitError}
        submitting={saveCategory.isPending}
        onClose={() => {
          setSubmitError('');
          setEditing(null);
        }}
        onSubmit={async (values) => {
          setSubmitError('');
          try {
            await saveCategory.mutateAsync({ id: editing?.id || undefined, payload: values });
          } catch (error) {
            setSubmitError(normalizeApiError(error).message);
            throw error;
          }
        }}
      />

      <Modal
        open={Boolean(deleting)}
        onClose={() => {
          setDeleteError('');
          setDeleting(null);
        }}
        title="Delete category"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteCategory.isPending}
              onClick={async () => {
                if (!deleting?.id) {
                  return;
                }

                setDeleteError('');
                try {
                  await deleteCategory.mutateAsync(deleting.id);
                  setDeleting(null);
                } catch (error) {
                  setDeleteError(normalizeApiError(error).message);
                }
              }}
            >
              Delete category
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            This will permanently remove <span className="font-medium text-slate-900">{deleting?.name}</span> if it is not a default category.
          </p>
          {deleteError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{deleteError}</div> : null}
        </div>
      </Modal>
    </div>
  );
}
