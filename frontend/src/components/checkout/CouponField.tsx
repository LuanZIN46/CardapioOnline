import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { formatCurrency } from '@/lib/format';
import { validateCoupon } from '@/lib/pricing';
import { fetchCouponByCode } from '@/services/catalog.service';
import { useCartStore } from '@/store/cart.store';
import type { Money } from '@/types';

interface CouponFieldProps {
  subtotal: Money;
  discount: Money;
  appliedCode?: string;
}

export function CouponField({ subtotal, discount, appliedCode }: CouponFieldProps) {
  const setCouponCode = useCartStore((state) => state.setCouponCode);
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);

  const apply = async () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;

    setChecking(true);
    try {
      const coupon = await fetchCouponByCode(normalized);
      const result = validateCoupon(coupon, subtotal);

      if (!result.valid) {
        toast(result.reason ?? 'Cupom inválido.', 'error');
        return;
      }

      setCouponCode(normalized);
      setCode('');
      toast('Cupom aplicado com sucesso!');
    } finally {
      setChecking(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
        <span className="flex min-w-0 items-center gap-2 text-sm">
          <Tag className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
          <span className="truncate font-bold text-emerald-300">{appliedCode}</span>
          {discount > 0 && (
            <span className="text-emerald-400/80">- {formatCurrency(discount)}</span>
          )}
        </span>
        <button
          type="button"
          onClick={() => setCouponCode(undefined)}
          aria-label="Remover cupom"
          className="rounded-lg p-1.5 text-emerald-300 transition-colors hover:bg-emerald-500/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        value={code}
        onChange={(event) => setCode(event.target.value.toUpperCase())}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            void apply();
          }
        }}
        placeholder="Código promocional"
        aria-label="Código promocional"
        className="w-full rounded-xl border border-surface-border bg-surface-muted px-4 py-3 text-sm uppercase text-brand-white placeholder:normal-case placeholder:text-brand-white/35 focus:border-brand-gold focus:outline-none"
      />
      <Button variant="secondary" onClick={apply} loading={checking} disabled={!code.trim()}>
        Aplicar
      </Button>
    </div>
  );
}
