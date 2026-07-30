import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StepIndicatorProps {
  /** Etapa atual, começando em 1. */
  atual: number;
  etapas: string[];
}

/** Mostra em que ponto do checkout o cliente está. */
export function StepIndicator({ atual, etapas }: StepIndicatorProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-white/45">
        Etapa {atual} de {etapas.length}
      </p>

      <ol className="mt-2 flex items-center gap-2" aria-label="Progresso do pedido">
        {etapas.map((rotulo, indice) => {
          const numero = indice + 1;
          const concluida = numero < atual;
          const ativa = numero === atual;

          return (
            <li key={rotulo} className="flex flex-1 items-center gap-2">
              <span
                aria-current={ativa ? 'step' : undefined}
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  concluida && 'bg-emerald-500/20 text-emerald-400',
                  ativa && 'bg-brand-gold text-brand-black',
                  !concluida && !ativa && 'bg-surface-muted text-brand-white/40',
                )}
              >
                {concluida ? <Check className="h-4 w-4" aria-hidden /> : numero}
              </span>

              <span
                className={cn(
                  'truncate text-sm font-semibold',
                  ativa ? 'text-brand-white' : 'text-brand-white/45',
                )}
              >
                {rotulo}
              </span>

              {numero < etapas.length && (
                <span
                  aria-hidden
                  className={cn(
                    'h-px flex-1 rounded',
                    concluida ? 'bg-emerald-500/40' : 'bg-surface-border',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
