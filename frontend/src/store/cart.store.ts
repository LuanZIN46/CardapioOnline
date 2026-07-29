import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartItemAddon } from '@/types';

const STORAGE_KEY = 'bar-do-pardal:cart';

/** Duas linhas do carrinho só se fundem quando produto, adicionais e observação são idênticos. */
function buildLineId(
  productId: string,
  addons: CartItemAddon[],
  notes: string | undefined,
): string {
  const addonSignature = [...addons]
    .sort((a, b) => a.addonId.localeCompare(b.addonId))
    .map((addon) => `${addon.addonId}x${addon.quantity}`)
    .join('|');
  return [productId, addonSignature, notes?.trim().toLowerCase() ?? ''].join('::');
}

export interface CartState {
  items: CartItem[];
  couponCode?: string;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  clear: () => void;
  setCouponCode: (code?: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: undefined,

      addItem: (item) =>
        set((state) => {
          const id = buildLineId(item.productId, item.addons, item.notes);
          const existing = state.items.find((line) => line.id === id);
          if (existing) {
            return {
              items: state.items.map((line) =>
                line.id === id ? { ...line, quantity: line.quantity + item.quantity } : line,
              ),
            };
          }
          return { items: [...state.items, { ...item, id }] };
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((line) => line.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((line) => line.id !== id)
              : state.items.map((line) => (line.id === id ? { ...line, quantity } : line)),
        })),

      incrementItem: (id) =>
        set((state) => ({
          items: state.items.map((line) =>
            line.id === id ? { ...line, quantity: line.quantity + 1 } : line,
          ),
        })),

      decrementItem: (id) =>
        set((state) => ({
          items: state.items.flatMap((line) => {
            if (line.id !== id) return [line];
            return line.quantity > 1 ? [{ ...line, quantity: line.quantity - 1 }] : [];
          }),
        })),

      clear: () => set({ items: [], couponCode: undefined }),

      setCouponCode: (code) => set({ couponCode: code }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode }),
    },
  ),
);
