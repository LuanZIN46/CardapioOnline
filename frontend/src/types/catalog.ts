import type { Identifiable, Money, Orderable } from './common';

export type ProductBadge = 'novo' | 'promocao' | 'mais-vendido';

export interface Category extends Identifiable, Orderable {
  name: string;
  slug: string;
  icon: string;
  visible: boolean;
}

export interface Addon extends Identifiable {
  name: string;
  price: Money;
  available: boolean;
}

export interface AddonGroup extends Identifiable {
  name: string;
  description?: string;
  /** Quantidade mínima de opções que o cliente precisa escolher. */
  minSelection: number;
  /** Quantidade máxima de opções (somando as repetições de cada adicional). */
  maxSelection: number;
  /** Permite escolher o mesmo adicional mais de uma vez (ex.: bacon x2). */
  allowRepeat: boolean;
  options: Addon[];
}

export interface Product extends Identifiable, Orderable {
  name: string;
  slug: string;
  description: string;
  ingredients: string[];
  categoryId: string;
  imageUrl: string;
  price: Money;
  promoPrice?: Money;
  badges: ProductBadge[];
  available: boolean;
  addonGroupIds: string[];
  serves?: string;
  preparationTimeMinutes?: number;
}

export interface Banner extends Identifiable, Orderable {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkTo?: string;
  active: boolean;
}
