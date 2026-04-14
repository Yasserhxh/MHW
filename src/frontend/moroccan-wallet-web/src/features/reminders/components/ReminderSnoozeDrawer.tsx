import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/Button';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import type { Reminder } from '../types/reminders.types';

type SnoozeFormValues = {
  until: string;
};

function getDefaultUntil(reminder?: Reminder | null) {
  if (reminder?.snoozedUntil) {
    return reminder.snoozedUntil.slice(0, 10);
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

export function ReminderSnoozeDrawer({
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
  onSubmit: (until: string) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SnoozeFormValues>({
    defaultValues: { until: getDefaultUntil(reminder) },
  });

  useEffect(() => {
    if (open) {
      reset({ until: getDefaultUntil(reminder) });
    }
  }, [open, reminder, reset]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={reminder ? `Snooze ${reminder.title}` : 'Snooze reminder'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button form="snooze-reminder-form" type="submit" loading={isPending}>
            Snooze reminder
          </Button>
        </>
      }
    >
      <form
        id="snooze-reminder-form"
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(new Date(`${values.until}T09:00:00.000Z`).toISOString());
        })}
      >
        <Input
          label="Snooze until"
          type="date"
          error={errors.until?.message}
          {...register('until', { required: 'Choose a date to snooze this reminder.' })}
        />
        <p className="text-sm text-slate-500">The reminder will move to the selected date and stay in your upcoming list.</p>
      </form>
    </Drawer>
  );
}
