import { coupons } from '@/data/coupons';
import { calculateTotals } from '@/lib/pricing';
import { useCartStore } from '@/store/cart.store';
import type { CartTotals, Money } from '@/types';

/** Leitura pontual dos totais fora do ciclo de render (ex.: resolver de formulário). */
export function getCartTotals(deliveryFee: Money): CartTotals {
  const { items, couponCode } = useCartStore.getState();
  const coupon = coupons.find((entry) => entry.code === couponCode);
  return calculateTotals({ items, deliveryFee, coupon });
}
