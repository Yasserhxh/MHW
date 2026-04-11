import { Badge } from './ui/Badge';
import type { ComponentProps } from 'react';

type BadgeProps = ComponentProps<typeof Badge>;

const statusMap: Record<string, Pick<BadgeProps, 'variant' | 'dot'> & { label: string }> = {
  // Expense statuses
  pending: { variant: 'warning', dot: true, label: 'Pending' },
  settled: { variant: 'success', dot: true, label: 'Settled' },
  overdue: { variant: 'danger', dot: true, label: 'Overdue' },
  paid: { variant: 'success', dot: true, label: 'Paid' },
  // Reminder statuses
  upcoming: { variant: 'info', dot: true, label: 'Upcoming' },
  today: { variant: 'warning', dot: true, label: 'Today' },
  completed: { variant: 'success', dot: true, label: 'Done' },
  // Notification statuses
  unread: { variant: 'primary', dot: true, label: 'Unread' },
  read: { variant: 'default', dot: false, label: 'Read' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusMap[status.toLowerCase()] ?? {
    variant: 'default' as const,
    dot: false,
    label: status,
  };

  return (
    <Badge variant={config.variant} dot={config.dot} className={className}>
      {config.label}
    </Badge>
  );
}
