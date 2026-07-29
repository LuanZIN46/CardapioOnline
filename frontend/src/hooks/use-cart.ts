import { useMemo } from 'react';
import { coupons } from '@/data/coupons';
import { calculateTotals } from '@/lib/pricing';
import { useCartStore } from '@/store/cart.store';
import type { Money } from '@/types';

interface UseCartTotalsOptions {
  deliveryFee: Money;
}

export function useCartTotals({ deliveryFee }: UseCartTotalsOptions) {
  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);

  const coupon = useMemo(
    () => coupons.find((entry) => entry.code === couponCode),
    [couponCode],
  );

  const totals = useMemo(
    () => calculateTotals({ items, deliveryFee, coupon }),
    [items, deliveryFee, coupon],
  );

  return { items, totals, coupon };
}

export function useCartCount(): number {
  return useCartStore((state) =>
    state.items.reduce((count, item) => count + item.quantity, 0),
  );
}
