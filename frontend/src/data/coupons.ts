import type { Coupon } from '@/types';

/**
 * Os encartes do Bar do Pardal não trazem cupons promocionais.
 * Estes códigos foram criados como exemplo e estão DESATIVADOS de propósito —
 * ativos, concederiam descontos reais que o estabelecimento não autorizou.
 * Basta trocar `active` para true (e ajustar valores) quando forem oficiais.
 */
export const coupons: Coupon[] = [
  {
    id: 'cpn-primeira',
    code: 'PARDAL10',
    type: 'percent',
    value: 10,
    minimumOrder: 3000,
    active: false,
    description: '10% de desconto em pedidos acima de R$ 30,00',
  },
  {
    id: 'cpn-frete',
    code: 'FRETEGRATIS',
    type: 'free-delivery',
    value: 0,
    minimumOrder: 5000,
    active: false,
    description: 'Entrega grátis em pedidos acima de R$ 50,00',
  },
  {
    id: 'cpn-cinco',
    code: 'PARDAL5',
    type: 'fixed',
    value: 500,
    minimumOrder: 2500,
    active: false,
    description: 'R$ 5,00 de desconto em pedidos acima de R$ 25,00',
  },
];
