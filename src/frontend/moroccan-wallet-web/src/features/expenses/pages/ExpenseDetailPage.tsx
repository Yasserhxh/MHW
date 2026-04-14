import { useMemo, useState } from 'react';
import { PencilLine, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { normalizeApiError } from '@/shared/utils/error';
import { AddExpenseDrawer } from '../components/AddExpenseDrawer';
import { useDeleteExpense, useExpense, useExpensesSnapshot, useUpdateExpense } from '../hooks/useExpenses';

export default function ExpenseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const { data, isLoading, isError, refetch } = useExpense(id);
  const { data: snapshot } = useExpensesSnapshot({
    search: '',
    dateRange: 'this-month',
    category: 'all',
    walletId: 'all',
    paymentMethodId: 'all',
  });
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const initialValues = useMemo(
    () =>
      data
        ? {
            title: data.title,
            amount: data.amount,
            type: data.type,
            category: data.category,
            walletId: data.walletId,
            paymentMethodId: data.paymentMethodId,
            date: data.date.slice(0, 10),
            notes: data.notes ?? '',
          }
        : undefined,
    [data]
  );

  if (isLoading) {
    return <LoadingState message="Loading transaction..." />;
  }

  if (isError || !data) {
    return <ErrorState message="Transaction not found." onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={data.title}
        subtitle="Transaction detail"
        action={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<PencilLine className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Summary">
          <div className="space-y-3">
            <CurrencyAmount amount={data.amount} size="xl" positive={data.type === 'income'} negative={data.type === 'expense'} />
            <div className="text-sm text-slate-500">
              {data.dateLabel} · {data.paymentMethodLabel}
            </div>
            {data.notes ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{data.notes}</div> : null}
          </div>
        </SectionCard>

        <SectionCard title="Metadata">
          <div className="space-y-3 text-sm text-slate-600">
            <div>Type: {data.type}</div>
            <div>Category: {data.categoryLabel}</div>
            <div>Wallet: {data.walletLabel}</div>
            <div>Recurring: {data.isRecurring ? 'Yes' : 'No'}</div>
            <div>Created at: {data.createdAt}</div>
          </div>
        </SectionCard>
      </div>

      {snapshot && initialValues ? (
        <AddExpenseDrawer
          open={isEditOpen}
          onClose={() => {
            setFormError('');
            setEditOpen(false);
          }}
          title="Edit transaction"
          submitLabel="Save changes"
          categories={snapshot.categories}
          wallets={snapshot.wallets}
          paymentMethods={snapshot.paymentMethods}
          initialValues={initialValues}
          submitting={updateExpense.isPending}
          errorMessage={formError}
          onSubmit={async (values) => {
            setFormError('');
            try {
              await updateExpense.mutateAsync({
                id: data.id,
                ...values,
              });
              await refetch();
            } catch (error) {
              setFormError(normalizeApiError(error).message);
              throw error;
            }
          }}
        />
      ) : null}

      <Modal
        open={isDeleteOpen}
        onClose={() => {
          setDeleteError('');
          setDeleteOpen(false);
        }}
        title="Delete transaction"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteExpense.isPending}
              onClick={async () => {
                setDeleteError('');
                try {
                  await deleteExpense.mutateAsync(data.id);
                  navigate('/expenses');
                } catch (error) {
                  setDeleteError(normalizeApiError(error).message);
                }
              }}
            >
              Delete transaction
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            This will permanently remove <span className="font-medium text-slate-900">{data.title}</span> from your transaction history.
          </p>
          {deleteError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{deleteError}</div> : null}
        </div>
      </Modal>
    </div>
  );
}
