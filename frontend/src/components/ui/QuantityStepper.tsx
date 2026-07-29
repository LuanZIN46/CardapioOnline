import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Mostra a lixeira no lugar do "-" quando a quantidade chega em 1. */
  removable?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  removable = false,
  label = 'quantidade',
  size = 'md',
}: QuantityStepperProps) {
  const showTrash = removable && value <= min;
  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-surface-border bg-surface-muted p-1',
      )}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={!removable && value <= min}
        aria-label={showTrash ? `Remover ${label}` : `Diminuir ${label}`}
        className={cn(
          buttonSize,
          'flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30',
          showTrash ? 'text-red-400' : 'text-brand-white',
        )}
      >
        {showTrash ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
      </button>

      <span
        aria-live="polite"
        className={cn('min-w-8 text-center font-bold', size === 'sm' ? 'text-sm' : 'text-base')}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Aumentar ${label}`}
        className={cn(
          buttonSize,
          'flex items-center justify-center rounded-lg text-brand-gold transition-colors hover:bg-brand-gold/15 disabled:opacity-30',
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
