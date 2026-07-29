import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { useCartTotals } from '@/hooks/use-cart';
import { useUiStore } from '@/store/ui.store';
import type { Money } from '@/types';

interface FloatingCartBarProps {
  deliveryFee: Money;
}

export function FloatingCartBar({ deliveryFee }: FloatingCartBarProps) {
  const { totals } = useCartTotals({ deliveryFee });
  const openCart = useUiStore((state) => state.openCart);
  const isCartOpen = useUiStore((state) => state.isCartOpen);

  const visible = totals.itemCount > 0 && !isCartOpen;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-4 pt-3"
        >
          <button
            type="button"
            onClick={openCart}
            className="container flex h-14 items-center justify-between gap-4 rounded-2xl bg-brand-gold px-5 text-brand-black shadow-gold transition-transform active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 font-bold">
              <ShoppingBag className="h-5 w-5" aria-hidden />
              Ver carrinho
            </span>
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="rounded-full bg-black/15 px-2 py-0.5">
                {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'itens'}
              </span>
              {formatCurrency(totals.subtotal)}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
