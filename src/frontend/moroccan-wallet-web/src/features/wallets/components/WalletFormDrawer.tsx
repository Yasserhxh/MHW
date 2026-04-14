import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { WalletPayload, WalletView } from '../types/wallets.types';

interface WalletFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: WalletPayload) => Promise<void>;
  submitting?: boolean;
  errorMessage?: string;
  title?: string;
  submitLabel?: string;
  initialWallet?: WalletView | null;
}

const defaultValues: WalletPayload = {
  name: '',
  type: 'bank',
  currency: 'MAD',
  balance: 0,
  color: 'teal',
  icon: 'wallet',
};

export function WalletFormDrawer({
  open,
  onClose,
  onSubmit,
  submitting = false,
  errorMessage,
  title = 'Add wallet',
  submitLabel = 'Save wallet',
  initialWallet,
}: WalletFormDrawerProps) {
  const { register, handleSubmit, reset } = useForm<WalletPayload>({
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialWallet
          ? {
              name: initialWallet.name,
              type: initialWallet.type,
              currency: initialWallet.currency,
              balance: initialWallet.balance,
              color: initialWallet.color,
              icon: initialWallet.icon,
            }
          : defaultValues
      );
    }
  }, [initialWallet, open, reset]);

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
          <Button form="wallet-form" type="submit" loading={submitting}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        id="wallet-form"
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          if (submitting) {
            return;
          }

          await onSubmit(values);
          onClose();
        })}
      >
        <Input label="Wallet name" {...register('name')} />
        {errorMessage ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Type</label>
            <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('type')}>
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
              <option value="shared-household">Shared household</option>
              <option value="savings">Savings</option>
            </select>
          </div>
          <Input label="Balance" type="number" step="0.01" {...register('balance', { valueAsNumber: true })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Currency" {...register('currency')} />
          <Input label="Color token" {...register('color')} />
        </div>
        <Input label="Icon" {...register('icon')} />
      </form>
    </Drawer>
  );
}
