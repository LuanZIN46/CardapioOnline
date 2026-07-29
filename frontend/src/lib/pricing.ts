import type { CartItem, CartTotals, Coupon, Money, Product } from '@/types';

export function effectivePrice(product: Product): Money {
  return product.promoPrice ?? product.price;
}

export function hasDiscount(product: Product): boolean {
  return product.promoPrice !== undefined && product.promoPrice < product.price;
}

export function discountPercent(product: Product): number {
  if (!hasDiscount(product)) return 0;
  return Math.round((1 - product.promoPrice! / product.price) * 100);
}

export function addonsTotal(item: CartItem): Money {
  return item.addons.reduce((total, addon) => total + addon.price * addon.quantity, 0);
}

export function itemUnitTotal(item: CartItem): Money {
  return item.unitPrice + addonsTotal(item);
}

export function itemTotal(item: CartItem): Money {
  return itemUnitTotal(item) * item.quantity;
}

export function cartSubtotal(items: CartItem[]): Money {
  return items.reduce((total, item) => total + itemTotal(item), 0);
}

export interface CouponValidation {
  valid: boolean;
  reason?: string;
  coupon?: Coupon;
}

export function validateCoupon(
  coupon: Coupon | undefined,
  subtotal: Money,
  now = new Date(),
): CouponValidation {
  if (!coupon) return { valid: false, reason: 'Cupom não encontrado.' };
  if (!coupon.active) return { valid: false, reason: 'Este cupom não está mais ativo.' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return { valid: false, reason: 'Este cupom expirou.' };
  }
  if (subtotal < coupon.minimumOrder) {
    return { valid: false, reason: coupon.description, coupon };
  }
  return { valid: true, coupon };
}

interface TotalsInput {
  items: CartItem[];
  deliveryFee: Money;
  coupon?: Coupon;
}

export function calculateTotals({ items, deliveryFee, coupon }: TotalsInput): CartTotals {
  const subtotal = cartSubtotal(items);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  let discount = 0;
  let fee = deliveryFee;

  if (coupon && validateCoupon(coupon, subtotal).valid) {
    if (coupon.type === 'percent') {
      discount = Math.round((subtotal * coupon.value) / 100);
    } else if (coupon.type === 'fixed') {
      discount = Math.min(coupon.value, subtotal);
    } else {
      fee = 0;
    }
  }

  return {
    subtotal,
    deliveryFee: fee,
    discount,
    total: Math.max(0, subtotal - discount) + fee,
    itemCount,
  };
}
