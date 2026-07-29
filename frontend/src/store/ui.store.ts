import { create } from 'zustand';
import type { Product } from '@/types';

interface UiState {
  isCartOpen: boolean;
  selectedProduct?: Product;
  openCart: () => void;
  closeCart: () => void;
  openProduct: (product: Product) => void;
  closeProduct: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  isCartOpen: false,
  selectedProduct: undefined,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  openProduct: (product) => set({ selectedProduct: product }),
  closeProduct: () => set({ selectedProduct: undefined }),
}));
