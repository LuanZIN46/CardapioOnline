import { addonGroups } from '@/data/addons';
import { categories } from '@/data/categories';
import { coupons } from '@/data/coupons';
import { products } from '@/data/products';
import { storeSettings } from '@/data/settings';
import type { AddonGroup, Category, Coupon, Product, StoreSettings } from '@/types';

/**
 * Camada de acesso ao catálogo. Hoje resolve a partir dos dados locais;
 * quando a API do backend subir, basta trocar o corpo destas funções por chamadas `http`.
 */
const SIMULATED_LATENCY_MS = 220;

function resolve<T>(value: T): Promise<T> {
  return new Promise((done) => setTimeout(() => done(value), SIMULATED_LATENCY_MS));
}

export function fetchCategories(): Promise<Category[]> {
  return resolve(
    categories.filter((category) => category.visible).sort((a, b) => a.displayOrder - b.displayOrder),
  );
}

export function fetchProducts(): Promise<Product[]> {
  return resolve([...products].sort((a, b) => a.displayOrder - b.displayOrder));
}

export function fetchAddonGroups(): Promise<AddonGroup[]> {
  return resolve(addonGroups);
}

export function fetchSettings(): Promise<StoreSettings> {
  return resolve(storeSettings);
}

export function fetchCouponByCode(code: string): Promise<Coupon | undefined> {
  const normalized = code.trim().toUpperCase();
  return resolve(coupons.find((coupon) => coupon.code === normalized));
}
