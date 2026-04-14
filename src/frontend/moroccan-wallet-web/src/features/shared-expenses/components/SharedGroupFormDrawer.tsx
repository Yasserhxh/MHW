import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { CreateSharedGroupRequest } from '../types/shared-expenses.types';

interface SharedGroupFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateSharedGroupRequest) => Promise<void>;
  submitting?: boolean;
  errorMessage?: string;
}

const defaultValues: CreateSharedGroupRequest = {
  name: '',
  description: '',
  currency: 'MAD',
};

export function SharedGroupFormDrawer({
  open,
  onClose,
  onSubmit,
  submitting = false,
  errorMessage,
}: SharedGroupFormDrawerProps) {
  const { register, handleSubmit, reset } = useForm<CreateSharedGroupRequest>({
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Create household"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button form="shared-group-form" type="submit" loading={submitting}>
            Create group
          </Button>
        </>
      }
    >
      <form
        id="shared-group-form"
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          if (submitting) {
            return;
          }

          await onSubmit({
            name: values.name,
            description: values.description?.trim() || undefined,
            currency: values.currency,
          });
          onClose();
        })}
      >
        {errorMessage ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}
        <Input label="Group name" {...register('name', { required: true })} />
        <Input label="Currency" {...register('currency', { required: true })} />
        <div className="space-y-1.5">
          <label htmlFor="shared-group-description" className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="shared-group-description"
            rows={4}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('description')}
          />
        </div>
      </form>
    </Drawer>
  );
}
