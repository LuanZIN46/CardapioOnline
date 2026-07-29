import type { Coupon } from '@/types';

export const coupons: Coupon[] = [
  {
    id: 'cpn-primeira',
    code: 'PARDAL10',
    type: 'percent',
    value: 10,
    minimumOrder: 3000,
    active: true,
    description: '10% de desconto em pedidos acima de R$ 30,00',
  },
  {
    id: 'cpn-frete',
    code: 'FRETEGRATIS',
    type: 'free-delivery',
    value: 0,
    minimumOrder: 5000,
    active: true,
    description: 'Entrega grátis em pedidos acima de R$ 50,00',
  },
  {
    id: 'cpn-cinco',
    code: 'PARDAL5',
    type: 'fixed',
    value: 500,
    minimumOrder: 2500,
    active: true,
    description: 'R$ 5,00 de desconto em pedidos acima de R$ 25,00',
  },
];
