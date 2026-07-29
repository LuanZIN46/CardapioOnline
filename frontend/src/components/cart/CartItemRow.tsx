import { motion } from 'framer-motion';
import { ProductImage } from '@/components/ui/ProductImage';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { formatCurrency } from '@/lib/format';
import { itemTotal } from '@/lib/pricing';
import { useCartStore } from '@/store/cart.store';
import type { CartItem } from '@/types';

export function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="flex gap-3 py-4">
        <ProductImage
          src={item.imageUrl}
          alt={item.name}
          className="h-16 w-16 shrink-0 rounded-xl"
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold leading-tight">{item.name}</h3>

          {item.addons.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {item.addons.map((addon) => (
                <li key={addon.addonId} className="text-xs text-brand-white/50">
                  + {addon.name}
                  {addon.quantity > 1 && ` (${addon.quantity}x)`}
                  {addon.price > 0 && ` · ${formatCurrency(addon.price * addon.quantity)}`}
                </li>
              ))}
            </ul>
          )}

          {item.notes && (
            <p className="mt-1 text-xs italic text-brand-white/45">📝 {item.notes}</p>
          )}

          <div className="mt-2.5 flex items-center justify-between gap-3">
            <QuantityStepper
              value={item.quantity}
              size="sm"
              removable
              label={item.name}
              onChange={(quantity) => updateQuantity(item.id, quantity)}
            />
            <span className="font-display text-sm font-extrabold text-brand-gold">
              {formatCurrency(itemTotal(item))}
            </span>
          </div>
        </div>
      </div>
    </motion.li>
  );
}
