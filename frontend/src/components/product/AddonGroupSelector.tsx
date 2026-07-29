import { Check } from 'lucide-react';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import type { AddonGroup } from '@/types';

export type AddonSelection = Record<string, number>;

interface AddonGroupSelectorProps {
  group: AddonGroup;
  selection: AddonSelection;
  onChange: (addonId: string, quantity: number) => void;
  showError?: boolean;
}

export function selectedCount(group: AddonGroup, selection: AddonSelection): number {
  return group.options.reduce((total, option) => total + (selection[option.id] ?? 0), 0);
}

export function isGroupValid(group: AddonGroup, selection: AddonSelection): boolean {
  return selectedCount(group, selection) >= group.minSelection;
}

export function AddonGroupSelector({
  group,
  selection,
  onChange,
  showError = false,
}: AddonGroupSelectorProps) {
  const total = selectedCount(group, selection);
  const isSingleChoice = group.maxSelection === 1 && !group.allowRepeat;
  const isRequired = group.minSelection > 0;
  const invalid = showError && !isGroupValid(group, selection);

  return (
    <section className="border-t border-surface-border px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-sm font-bold">{group.name}</h3>
          {group.description && (
            <p className="text-xs text-brand-white/45">{group.description}</p>
          )}
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase',
            isRequired
              ? invalid
                ? 'bg-red-500/15 text-red-400'
                : 'bg-brand-gold/15 text-brand-gold'
              : 'bg-white/5 text-brand-white/50',
          )}
        >
          {isRequired ? 'Obrigatório' : 'Opcional'}
        </span>
      </div>

      {invalid && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-400">
          Escolha pelo menos {group.minSelection} opção{group.minSelection > 1 ? 'ões' : ''}.
        </p>
      )}

      <ul className="mt-3 space-y-2" role={isSingleChoice ? 'radiogroup' : 'group'}>
        {group.options.map((option) => {
          const quantity = selection[option.id] ?? 0;
          const isSelected = quantity > 0;
          const groupFull = total >= group.maxSelection;

          return (
            <li key={option.id}>
              <div
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                  isSelected
                    ? 'border-brand-gold/60 bg-brand-gold/5'
                    : 'border-surface-border bg-surface-muted',
                  !option.available && 'opacity-40',
                )}
              >
                {isSingleChoice ? (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={!option.available}
                    onClick={() => onChange(option.id, isSelected ? 0 : 1)}
                    className="flex flex-1 items-center gap-3 text-left disabled:cursor-not-allowed"
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                        isSelected ? 'border-brand-gold bg-brand-gold' : 'border-surface-border',
                      )}
                      aria-hidden
                    >
                      {isSelected && <Check className="h-3 w-3 text-brand-black" />}
                    </span>
                    <AddonLabel name={option.name} price={option.price} />
                  </button>
                ) : (
                  <>
                    <AddonLabel name={option.name} price={option.price} />
                    {isSelected ? (
                      <QuantityStepper
                        value={quantity}
                        size="sm"
                        min={1}
                        max={group.allowRepeat ? group.maxSelection : 1}
                        removable
                        label={option.name}
                        onChange={(next) => onChange(option.id, next)}
                      />
                    ) : (
                      <button
                        type="button"
                        disabled={!option.available || groupFull}
                        onClick={() => onChange(option.id, 1)}
                        className="shrink-0 rounded-lg border border-brand-gold/50 px-3 py-1.5 text-xs font-bold text-brand-gold transition-colors hover:bg-brand-gold/10 disabled:opacity-30"
                      >
                        Adicionar
                      </button>
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function AddonLabel({ name, price }: { name: string; price: number }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium">{name}</span>
      <span className="text-xs text-brand-gold">
        {price > 0 ? `+ ${formatCurrency(price)}` : 'Sem custo'}
      </span>
    </span>
  );
}
