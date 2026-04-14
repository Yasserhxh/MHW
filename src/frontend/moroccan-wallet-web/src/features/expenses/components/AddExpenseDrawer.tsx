import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { expenseFormSchema, type ExpenseFormValues } from '../schemas/expense.schema';
import type { CategoryOption, PaymentMethodOption, WalletOption } from '../types/expenses.types';

interface AddExpenseDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues) => Promise<void>;
  categories: CategoryOption[];
  wallets: WalletOption[];
  paymentMethods: PaymentMethodOption[];
  initialValues?: Partial<ExpenseFormValues>;
  submitting?: boolean;
  title?: string;
  submitLabel?: string;
  errorMessage?: string;
}

export function AddExpenseDrawer({
  open,
  onClose,
  onSubmit,
  categories,
  wallets,
  paymentMethods,
  initialValues,
  submitting = false,
  title = 'Quick add transaction',
  submitLabel = 'Save transaction',
  errorMessage,
}: AddExpenseDrawerProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: '',
      amount: 0,
      type: 'expense',
      category: categories[0]?.id ?? 'uncategorized',
      walletId: wallets[0]?.id ?? 'unassigned',
      paymentMethodId: paymentMethods[0]?.id ?? 'cash',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });
  const selectedType = useWatch({ control, name: 'type' });
  const selectedCategory = useWatch({ control, name: 'category' });

  const filteredCategories = useMemo(() => {
    const matches = categories.filter((category) => !category.type || category.type === selectedType);
    return matches.length ? matches : categories;
  }, [categories, selectedType]);

  useEffect(() => {
    if (open) {
      reset({
        title: initialValues?.title ?? '',
        amount: initialValues?.amount ?? 0,
        type: initialValues?.type ?? 'expense',
        category: initialValues?.category ?? categories[0]?.id ?? 'uncategorized',
        walletId: initialValues?.walletId ?? wallets[0]?.id ?? 'unassigned',
        paymentMethodId: initialValues?.paymentMethodId ?? paymentMethods[0]?.id ?? 'cash',
        date: initialValues?.date ?? new Date().toISOString().slice(0, 10),
        notes: initialValues?.notes ?? '',
      });
    }
  }, [categories, initialValues, open, paymentMethods, reset, wallets]);

  useEffect(() => {
    if (!filteredCategories.some((category) => category.id === selectedCategory)) {
      setValue('category', filteredCategories[0]?.id ?? 'uncategorized');
    }
  }, [filteredCategories, selectedCategory, setValue]);

  const submit = handleSubmit(async (values) => {
    if (submitting) {
      return;
    }
    await onSubmit(values);
    onClose();
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button form="quick-add-expense-form" type="submit" loading={submitting}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="quick-add-expense-form" onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" placeholder="e.g. Weekly groceries" error={errors.title?.message} {...register('title')} />
          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />
        </div>

        {errorMessage ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Transaction type</label>
                <select {...field} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            )}
          />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select {...field} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {filteredCategories.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="walletId"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Wallet</label>
                <select {...field} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
          <Controller
            name="paymentMethodId"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Payment method</label>
                <select {...field} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
        </div>

        <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            rows={4}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Optional note for household context"
            {...register('notes')}
          />
          {errors.notes?.message ? <p className="text-xs text-red-500">{errors.notes.message}</p> : null}
        </div>
      </form>
    </Drawer>
  );
}
