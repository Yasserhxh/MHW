import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/Button';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import type { CreateReminderRequest, Reminder } from '../types/reminders.types';
import { reminderFrequencyOptions, reminderTypeOptions } from '../lib/reminder';

type ReminderFormValues = {
  title: string;
  dueDate: string;
  amount?: number;
  category: CreateReminderRequest['category'];
  recurrence: CreateReminderRequest['recurrence'];
  notes: string;
};

const selectClassName =
  'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150';

function toFormValues(reminder?: Reminder): ReminderFormValues {
  return {
    title: reminder?.title ?? '',
    dueDate: reminder?.dueDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    amount: reminder?.amount,
    category: reminder?.category ?? 'custom',
    recurrence: reminder?.recurrence ?? 'once',
    notes: reminder?.notes ?? reminder?.description ?? '',
  };
}

export function ReminderFormDrawer({
  open,
  reminder,
  isPending,
  onClose,
  onSubmit,
}: {
  open: boolean;
  reminder?: Reminder | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReminderRequest) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReminderFormValues>({
    defaultValues: toFormValues(reminder ?? undefined),
  });

  useEffect(() => {
    if (open) {
      reset(toFormValues(reminder ?? undefined));
    }
  }, [open, reminder, reset]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={reminder ? 'Edit reminder' : 'Create reminder'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button form="reminder-form" type="submit" loading={isPending}>
            {reminder ? 'Save changes' : 'Save reminder'}
          </Button>
        </>
      }
    >
      <form
        id="reminder-form"
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            title: values.title.trim(),
            dueDate: new Date(`${values.dueDate}T09:00:00.000Z`).toISOString(),
            recurrence: values.recurrence ?? 'once',
            amount: typeof values.amount === 'number' && !Number.isNaN(values.amount) ? values.amount : undefined,
            category: values.category ?? 'custom',
            notes: values.notes.trim() || undefined,
          });
        })}
      >
        <Input
          label="Title"
          error={errors.title?.message}
          {...register('title', {
            required: 'Title is required.',
            maxLength: { value: 200, message: 'Title must be 200 characters or fewer.' },
          })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Due date"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate', { required: 'Due date is required.' })}
          />
          <Input
            label="Amount (optional)"
            type="number"
            step="0.01"
            min="0"
            error={errors.amount?.message}
            {...register('amount', {
              valueAsNumber: true,
              validate: (value) =>
                value === undefined || Number.isNaN(value) || value >= 0 || 'Amount cannot be negative.',
            })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700" htmlFor="reminder-category">
              Type
            </label>
            <select id="reminder-category" className={selectClassName} {...register('category')}>
              {reminderTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700" htmlFor="reminder-recurrence">
              Recurrence
            </label>
            <select id="reminder-recurrence" className={selectClassName} {...register('recurrence')}>
              {reminderFrequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700" htmlFor="reminder-notes">
            Notes
          </label>
          <textarea
            id="reminder-notes"
            rows={4}
            className={`${selectClassName} resize-none`}
            placeholder="Optional details for this reminder"
            {...register('notes', {
              maxLength: { value: 2000, message: 'Notes must be 2000 characters or fewer.' },
            })}
          />
          {errors.notes?.message ? <p className="text-xs text-red-500">{errors.notes.message}</p> : null}
          {!errors.notes?.message ? (
            <p className="text-xs text-slate-500">Email notification settings are not supported by the backend yet.</p>
          ) : null}
        </div>
      </form>
    </Drawer>
  );
}
