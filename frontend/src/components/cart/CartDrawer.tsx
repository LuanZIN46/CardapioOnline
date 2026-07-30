import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { formatCurrency } from '@/lib/format';
import { useCartTotals } from '@/hooks/use-cart';
import { useCartStore } from '@/store/cart.store';
import { useUiStore } from '@/store/ui.store';
import type { StoreSettings } from '@/types';

interface CartDrawerProps {
  settings: StoreSettings;
}

export function CartDrawer({ settings }: CartDrawerProps) {
  const navigate = useNavigate();
  const isOpen = useUiStore((state) => state.isCartOpen);
  const closeCart = useUiStore((state) => state.closeCart);
  const clear = useCartStore((state) => state.clear);
  const { items, totals } = useCartTotals({ deliveryFee: settings.deliveryFee });

  const isEmpty = items.length === 0;

  const goToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <Modal
      open={isOpen}
      onClose={closeCart}
      variant="drawer"
      title="Seu carrinho"
      description={
        isEmpty ? undefined : `${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'itens'}`
      }
      footer={
        isEmpty ? undefined : (
          <div className="space-y-3 pb-1">
            <div className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
              {totals.discount > 0 && (
                <Row
                  label="Desconto"
                  value={`- ${formatCurrency(totals.discount)}`}
                  className="text-emerald-400"
                />
              )}
              <Row
                label="Taxa de entrega"
                value={
                  totals.deliveryFee === 0 ? 'Grátis' : formatCurrency(totals.deliveryFee)
                }
                className="text-brand-white/50"
              />
              <div className="flex items-center justify-between border-t border-surface-border pt-2 font-display text-lg font-extrabold">
                <span>Total</span>
                <span className="text-brand-gold">{formatCurrency(totals.total)}</span>
              </div>
              <p className="text-[11px] text-brand-white/35">
                A taxa de entrega é removida caso escolha retirada no balcão.
              </p>
            </div>

            <Button size="lg" full onClick={goToCheckout}>
              Finalizar pedido
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" full onClick={closeCart}>
                Continuar comprando
              </Button>
              <Button
                variant="danger"
                size="md"
                aria-label="Limpar carrinho"
                onClick={() => clear()}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        )
      }
    >
      {isEmpty ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-8 py-16 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted">
            <ShoppingBag className="h-9 w-9 text-brand-gold/60" aria-hidden />
          </span>
          <div>
            <p className="font-display text-lg font-bold">Seu carrinho está vazio</p>
            <p className="mt-1 text-sm text-brand-white/50">
              Que tal começar por um lanche da casa?
            </p>
          </div>
          <Button variant="secondary" onClick={closeCart}>
            Ver cardápio
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-surface-border px-5">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Modal>
  );
}

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className ?? ''}`}>
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
