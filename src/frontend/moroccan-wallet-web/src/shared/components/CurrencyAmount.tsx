import { cn } from '@/shared/utils/cn';
import { formatCurrency } from '@/shared/utils/format';

interface CurrencyAmountProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  positive?: boolean;
  negative?: boolean;
  className?: string;
}

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg font-semibold',
  xl: 'text-2xl font-bold',
};

export function CurrencyAmount({
  amount,
  currency = 'MAD',
  size = 'md',
  positive,
  negative,
  className,
}: CurrencyAmountProps) {
  const isPositive = positive ?? amount > 0;
  const isNegative = negative ?? amount < 0;

  return (
    <span
      className={cn(
        sizes[size],
        isPositive && !isNegative && 'text-green-600',
        isNegative && 'text-red-600',
        !isPositive && !isNegative && 'text-slate-800',
        className
      )}
    >
      {formatCurrency(Math.abs(amount), currency)}
    </span>
  );
}
