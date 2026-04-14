import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { CreateSettlementRequest, SharedGroupOverview } from '../types/shared-expenses.types';

interface SettlementDrawerProps {
  open: boolean;
  group: SharedGroupOverview | null;
  onClose: () => void;
  onSubmit: (values: CreateSettlementRequest) => Promise<void>;
  submitting?: boolean;
  errorMessage?: string;
}

type SettlementFormValues = {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  settledOn: string;
  notes: string;
};

export function SettlementDrawer({
  open,
  group,
  onClose,
  onSubmit,
  submitting = false,
  errorMessage,
}: SettlementDrawerProps) {
  const { register, handleSubmit, reset, watch } = useForm<SettlementFormValues>({
    defaultValues: {
      fromUserId: '',
      toUserId: '',
      amount: 0,
      currency: 'MAD',
      settledOn: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  const fromUserId = watch('fromUserId');

  useEffect(() => {
    if (!open || !group) {
      return;
    }

    const debtors = group.balances.filter((member) => member.balance < 0);
    const creditors = group.balances.filter((member) => member.balance > 0);
    const defaultFrom = debtors[0]?.userId ?? group.members[0]?.userId ?? '';
    const defaultTo = creditors[0]?.userId ?? group.members.find((member) => member.userId !== defaultFrom)?.userId ?? '';

    reset({
      fromUserId: defaultFrom,
      toUserId: defaultTo,
      amount: debtors[0] ? Math.abs(debtors[0].balance) : 0,
      currency: group.currency,
      settledOn: new Date().toISOString().slice(0, 10),
      notes: '',
    });
  }, [group, open, reset]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Record settlement"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button form="shared-settlement-form" type="submit" loading={submitting}>
            Save settlement
          </Button>
        </>
      }
    >
      <form
        id="shared-settlement-form"
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          if (submitting || !group) {
            return;
          }

          await onSubmit({
            groupId: group.id,
            fromUserId: values.fromUserId,
            toUserId: values.toUserId,
            amount: values.amount,
            currency: values.currency,
            settledOn: values.settledOn,
            notes: values.notes.trim() || undefined,
          });
          onClose();
        })}
      >
        {errorMessage ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">From</label>
            <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('fromUserId', { required: true })}>
              {group?.members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">To</label>
            <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('toUserId', { required: true })}>
              {group?.members
                .filter((member) => member.userId !== fromUserId)
                .map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true, required: true })} />
          <Input label="Currency" {...register('currency', { required: true })} />
        </div>
        <Input label="Settled on" type="date" {...register('settledOn', { required: true })} />
        <div className="space-y-1.5">
          <label htmlFor="shared-settlement-notes" className="block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            id="shared-settlement-notes"
            rows={4}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('notes')}
          />
        </div>
      </form>
    </Drawer>
  );
}
