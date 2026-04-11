import { cn } from '@/shared/utils/cn';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Trend {
  value: number;
  label: string;
  positive?: boolean;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: Trend;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBg = 'bg-primary-50',
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-100 shadow-card p-5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={cn('p-2.5 rounded-xl', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} strokeWidth={1.75} />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1.5">
          {trend.positive ? (
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={cn('text-xs font-medium', trend.positive ? 'text-green-600' : 'text-red-600')}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
