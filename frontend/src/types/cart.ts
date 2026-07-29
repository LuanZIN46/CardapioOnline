import type { Money } from './common';

export interface CartItemAddon {
  addonId: string;
  groupId: string;
  name: string;
  price: Money;
  quantity: number;
}

export interface CartItem {
  /** Identidade da linha do carrinho: produto + adicionais + observação. */
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
  /** Preço unitário do produto já considerando promoção, sem adicionais. */
  unitPrice: Money;
  originalPrice?: Money;
  quantity: number;
  addons: CartItemAddon[];
  notes?: string;
}

export interface CartTotals {
  subtotal: Money;
  deliveryFee: Money;
  discount: Money;
  total: Money;
  itemCount: number;
}
