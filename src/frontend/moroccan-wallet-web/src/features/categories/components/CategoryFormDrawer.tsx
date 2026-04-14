import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { CategoryPayload, CategoryView } from '../types/categories.types';

interface CategoryFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryPayload) => Promise<void>;
  submitting?: boolean;
  errorMessage?: string;
  title?: string;
  submitLabel?: string;
  initialCategory?: CategoryView | null;
}

const defaultValues: CategoryPayload = {
  name: '',
  type: 'expense',
  color: '#0f766e',
  icon: 'tag',
};

export function CategoryFormDrawer({
  open,
  onClose,
  onSubmit,
  submitting = false,
  errorMessage,
  title = 'Add category',
  submitLabel = 'Save category',
  initialCategory,
}: CategoryFormDrawerProps) {
  const { register, handleSubmit, reset } = useForm<CategoryPayload>({
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialCategory
          ? {
              name: initialCategory.name,
              type: initialCategory.type,
              color: initialCategory.color,
              icon: initialCategory.icon,
            }
          : defaultValues
      );
    }
  }, [initialCategory, open, reset]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button form="category-form" type="submit" loading={submitting}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        id="category-form"
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          if (submitting) {
            return;
          }

          await onSubmit(values);
          onClose();
        })}
      >
        <Input label="Category name" {...register('name')} />
        {errorMessage ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Type</label>
            <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('type')}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <Input label="Color" type="color" {...register('color')} />
        </div>
        <Input label="Icon token" {...register('icon')} />
      </form>
    </Drawer>
  );
}
