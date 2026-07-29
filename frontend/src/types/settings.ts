import type { Money, Weekday } from './common';

export interface OpeningHour {
  weekday: Weekday;
  /** Formato "HH:mm". Quando `closed` é true, os horários são ignorados. */
  opensAt: string;
  closesAt: string;
  closed: boolean;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  logoUrl: string;
  /** Versão reduzida da logo (só o emblema), legível em tamanhos pequenos. */
  logoMarkUrl: string;
  bannerUrl: string;
  /** Somente dígitos, com DDI e DDD (ex.: 5514996440787). */
  whatsappNumber: string;
  phone: string;
  instagram?: string;
  facebook?: string;
  address: string;
  deliveryFee: Money;
  minimumOrder: Money;
  pixKey: string;
  deliveryTimeMinutes: { min: number; max: number };
  pickupTimeMinutes: { min: number; max: number };
  openingHours: OpeningHour[];
}

export interface StoreStatus {
  isOpen: boolean;
  /** Mensagem pronta para exibição, ex.: "Abre hoje às 18:00". */
  message: string;
  nextChange?: string;
}
