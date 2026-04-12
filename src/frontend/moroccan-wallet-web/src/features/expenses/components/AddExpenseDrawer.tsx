import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { EXPENSE_CATEGORIES } from '../types/expenses.types';

interface FormData {
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddExpenseDrawer({ open, onClose, onSuccess }: Props) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      category: 'other',
    },
  });

  const onSubmit = async (_data: FormData) => {
    await new Promise((r) => setTimeout(r, 500));
    reset();
    onSuccess?.();
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add expense"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button form="add-expense-form" type="submit" loading={isSubmitting}>
            Save expense
          </Button>
        </>
      }
    >
      <form id="add-expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          placeholder="e.g. Marjane groceries"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required' })}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Amount (MAD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('amount', {
                valueAsNumber: true,
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be positive' },
              })}
            />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
          </div>
        </div>

        <Controller
          name="category"
          control={control}
          rules={{ required: 'Category is required' }}
          render={({ field }) => (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <select
                {...field}
                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
            </div>
          )}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Notes (optional)</label>
          <textarea
            rows={3}
            placeholder="Any additional notes..."
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            {...register('notes')}
          />
        </div>
      </form>
    </Drawer>
  );
}
