import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { CreateSharedExpenseRequest, SharedGroupOverview } from '../types/shared-expenses.types';

interface SharedExpenseFormDrawerProps {
  open: boolean;
  group: SharedGroupOverview | null;
  onClose: () => void;
  onSubmit: (values: CreateSharedExpenseRequest) => Promise<void>;
  submitting?: boolean;
  errorMessage?: string;
}

type SharedExpenseFormValues = {
  title: string;
  amount: number;
  currency: string;
  date: string;
  participantIds: string[];
  notes: string;
};

export function SharedExpenseFormDrawer({
  open,
  group,
  onClose,
  onSubmit,
  submitting = false,
  errorMessage,
}: SharedExpenseFormDrawerProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<SharedExpenseFormValues>({
    defaultValues: {
      title: '',
      amount: 0,
      currency: 'MAD',
      date: new Date().toISOString().slice(0, 10),
      participantIds: [],
      notes: '',
    },
  });

  const participantIds = watch('participantIds');

  useEffect(() => {
    if (!open || !group) {
      return;
    }

    reset({
      title: '',
      amount: 0,
      currency: group.currency,
      date: new Date().toISOString().slice(0, 10),
      participantIds: group.members.map((member) => member.userId),
      notes: '',
    });
  }, [group, open, reset]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add shared expense"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button form="shared-expense-form" type="submit" loading={submitting}>
            Save expense
          </Button>
        </>
      }
    >
      <form
        id="shared-expense-form"
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          if (submitting || !group) {
            return;
          }

          await onSubmit({
            groupId: group.id,
            title: values.title,
            amount: values.amount,
            currency: values.currency,
            date: values.date,
            participantIds: values.participantIds,
            notes: values.notes.trim() || undefined,
          });

          onClose();
        })}
      >
        {errorMessage ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}
        <Input label="Title" {...register('title', { required: true })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true, required: true })} />
          <Input label="Currency" {...register('currency', { required: true })} />
        </div>
        <Input label="Date" type="date" {...register('date', { required: true })} />
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Participants</div>
          <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
            {group?.members.map((member) => {
              const checked = participantIds.includes(member.userId);
              return (
                <label key={member.userId} className="flex items-center justify-between gap-3 text-sm text-slate-700">
                  <span>{member.name}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={checked}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setValue('participantIds', [...participantIds, member.userId], { shouldDirty: true });
                        return;
                      }

                      setValue(
                        'participantIds',
                        participantIds.filter((participantId) => participantId !== member.userId),
                        { shouldDirty: true }
                      );
                    }}
                  />
                </label>
              );
            })}
          </div>
          <p className="text-xs text-slate-500">Equal split only for now. The backend currently records the payer as the authenticated user.</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="shared-expense-notes" className="block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            id="shared-expense-notes"
            rows={4}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('notes')}
          />
        </div>
      </form>
    </Drawer>
  );
}
