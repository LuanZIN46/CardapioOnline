import type { CartItem } from './cart';
import type { Identifiable, Money } from './common';

export type OrderType = 'delivery' | 'pickup';

export type PaymentMethod = 'pix' | 'card' | 'cash';

export type OrderStatus =
  | 'novo'
  | 'em-preparo'
  | 'saiu-para-entrega'
  | 'finalizado'
  | 'cancelado';

export interface CustomerInfo {
  name: string;
  phone: string;
}

export interface DeliveryAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
}

export interface OrderPayment {
  method: PaymentMethod;
  /** Valor que o cliente vai entregar em dinheiro, quando precisa de troco. */
  changeFor?: Money;
}

export interface Order extends Identifiable {
  code: string;
  createdAt: string;
  status: OrderStatus;
  customer: CustomerInfo;
  type: OrderType;
  address?: DeliveryAddress;
  payment: OrderPayment;
  items: CartItem[];
  notes?: string;
  couponCode?: string;
  subtotal: Money;
  deliveryFee: Money;
  discount: Money;
  total: Money;
}

export type CouponType = 'percent' | 'fixed' | 'free-delivery';

export interface Coupon extends Identifiable {
  code: string;
  type: CouponType;
  /** Percentual (0-100) para `percent`, centavos para `fixed`, ignorado em `free-delivery`. */
  value: number;
  minimumOrder: Money;
  expiresAt?: string;
  active: boolean;
  description: string;
}
