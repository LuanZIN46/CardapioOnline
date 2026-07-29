import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
        selected
          ? 'border-brand-gold bg-brand-gold/10'
          : 'border-surface-border bg-surface-muted hover:border-brand-gold/40',
        className,
      )}
    >
      {icon && (
        <span className={cn('shrink-0', selected ? 'text-brand-gold' : 'text-brand-white/50')} aria-hidden>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{title}</span>
        {description && <span className="block text-xs text-brand-white/50">{description}</span>}
      </span>
      <span
        className={cn(
          'h-4 w-4 shrink-0 rounded-full border-2',
          selected ? 'border-brand-gold bg-brand-gold' : 'border-surface-border',
        )}
        aria-hidden
      />
    </button>
  );
}
