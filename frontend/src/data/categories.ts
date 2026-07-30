import type { Category } from '@/types';

export const categories: Category[] = [
  { id: 'cat-lanches', name: 'Lanches', slug: 'lanches', icon: '🍔', displayOrder: 1, visible: true },
  { id: 'cat-porcoes', name: 'Porções', slug: 'porcoes', icon: '🍟', displayOrder: 2, visible: true },
  { id: 'cat-bebidas', name: 'Bebidas', slug: 'bebidas', icon: '🥤', displayOrder: 3, visible: true },
  { id: 'cat-cervejas', name: 'Cervejas', slug: 'cervejas', icon: '🍺', displayOrder: 4, visible: true },
  { id: 'cat-drinks', name: 'Drinks', slug: 'drinks', icon: '🍹', displayOrder: 5, visible: true },
];
