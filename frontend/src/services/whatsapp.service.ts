import { formatCurrency } from '@/lib/format';
import { itemTotal, itemUnitTotal } from '@/lib/pricing';
import type {
  CartItem,
  CartTotals,
  CustomerInfo,
  DeliveryAddress,
  OrderPayment,
  OrderType,
  PaymentMethod,
  StoreSettings,
} from '@/types';

const DIVIDER = '━━━━━━━━━━━━━━━━━━━━';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  card: 'Cartão (na entrega)',
  cash: 'Dinheiro',
};

export interface WhatsAppOrderPayload {
  orderCode: string;
  customer: CustomerInfo;
  type: OrderType;
  address?: DeliveryAddress;
  payment: OrderPayment;
  items: CartItem[];
  totals: CartTotals;
  couponCode?: string;
  notes?: string;
  settings: StoreSettings;
}

function formatItem(item: CartItem): string {
  const lines = [`*${item.quantity}x ${item.name}* — ${formatCurrency(itemTotal(item))}`];

  for (const addon of item.addons) {
    const quantity = addon.quantity > 1 ? ` (${addon.quantity}x)` : '';
    const price = addon.price > 0 ? ` — ${formatCurrency(addon.price * addon.quantity)}` : '';
    lines.push(`   ➕ ${addon.name}${quantity}${price}`);
  }

  if (item.addons.length > 0) {
    lines.push(`   _Unitário com adicionais: ${formatCurrency(itemUnitTotal(item))}_`);
  }

  if (item.notes) {
    lines.push(`   📝 _${item.notes}_`);
  }

  return lines.join('\n');
}

function formatAddress(address: DeliveryAddress): string {
  const lines = [
    `${address.street}, ${address.number}`,
    `Bairro: ${address.neighborhood}`,
    `Cidade: ${address.city}`,
    `CEP: ${address.zipCode}`,
  ];
  if (address.complement) lines.push(`Complemento: ${address.complement}`);
  if (address.reference) lines.push(`Referência: ${address.reference}`);
  return lines.join('\n');
}

function formatPayment(payment: OrderPayment, total: number, pixKey: string): string {
  const lines = [`💳 *Pagamento:* ${PAYMENT_LABELS[payment.method]}`];

  if (payment.method === 'pix') {
    lines.push(`🔑 Chave PIX: ${pixKey}`);
  }

  if (payment.method === 'cash' && payment.changeFor) {
    const change = payment.changeFor - total;
    lines.push(`💵 Troco para ${formatCurrency(payment.changeFor)}`);
    if (change > 0) lines.push(`↩️ Levar troco de ${formatCurrency(change)}`);
  }

  if (payment.method === 'cash' && !payment.changeFor) {
    lines.push('💵 Não precisa de troco');
  }

  return lines.join('\n');
}

export function buildWhatsAppMessage(payload: WhatsAppOrderPayload): string {
  const { orderCode, customer, type, address, payment, items, totals, couponCode, notes, settings } =
    payload;

  const blocks: string[] = [
    `🍔 *NOVO PEDIDO — ${settings.name}*`,
    `Pedido *#${orderCode}*`,
    DIVIDER,
    `👤 *Cliente:* ${customer.name}`,
    `📱 *Telefone:* ${customer.phone}`,
    `📦 *Tipo:* ${type === 'delivery' ? 'Entrega' : 'Retirada no balcão'}`,
    DIVIDER,
    '🛒 *ITENS DO PEDIDO*',
    items.map(formatItem).join('\n\n'),
    DIVIDER,
    [
      `Subtotal: ${formatCurrency(totals.subtotal)}`,
      type === 'delivery'
        ? `Taxa de entrega: ${totals.deliveryFee === 0 ? 'Grátis' : formatCurrency(totals.deliveryFee)}`
        : 'Retirada no balcão: sem taxa',
      totals.discount > 0
        ? `Desconto${couponCode ? ` (${couponCode})` : ''}: -${formatCurrency(totals.discount)}`
        : null,
      `*TOTAL: ${formatCurrency(totals.total)}*`,
    ]
      .filter(Boolean)
      .join('\n'),
    DIVIDER,
  ];

  if (type === 'delivery' && address) {
    blocks.push(`📍 *ENDEREÇO DE ENTREGA*\n${formatAddress(address)}`, DIVIDER);
  } else {
    blocks.push(`📍 *RETIRADA EM:*\n${settings.address}`, DIVIDER);
  }

  blocks.push(formatPayment(payment, totals.total, settings.pixKey));

  if (notes) {
    blocks.push(DIVIDER, `📝 *OBSERVAÇÕES GERAIS*\n${notes}`);
  }

  blocks.push(DIVIDER, '_Pedido enviado pelo cardápio online_ 🌐');

  return blocks.join('\n');
}

export function buildWhatsAppUrl(payload: WhatsAppOrderPayload): string {
  const message = encodeURIComponent(buildWhatsAppMessage(payload));
  return `https://wa.me/${payload.settings.whatsappNumber}?text=${message}`;
}

export function buildContactUrl(settings: StoreSettings, message?: string): string {
  const text = encodeURIComponent(
    message ?? `Olá! Vim pelo cardápio online do ${settings.name} e gostaria de tirar uma dúvida.`,
  );
  return `https://wa.me/${settings.whatsappNumber}?text=${text}`;
}

export function generateOrderCode(now = new Date()): string {
  const stamp = now.getTime().toString(36).toUpperCase().slice(-5);
  return `PD${stamp}`;
}
