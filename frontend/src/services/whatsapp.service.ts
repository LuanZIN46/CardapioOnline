import type { StoreSettings } from '@/types';

/**
 * Contato direto com o estabelecimento.
 *
 * O envio do pedido não mora mais aqui: agora o comprovante é gerado em PDF
 * (`services/pdf/orderPdf.service.ts`) e compartilhado por
 * `services/pdf/orderShare.service.ts`, porque links `wa.me` só transportam texto.
 */
export function buildContactUrl(settings: StoreSettings, message?: string): string {
  const text = encodeURIComponent(
    message ?? `Olá! Vim pelo cardápio online do ${settings.name} e gostaria de tirar uma dúvida.`,
  );
  return `https://wa.me/${settings.whatsappNumber}?text=${text}`;
}

/** Código curto e legível para identificar o pedido no comprovante e na conversa. */
export function generateOrderCode(now = new Date()): string {
  const stamp = now.getTime().toString(36).toUpperCase().slice(-5);
  return `PD${stamp}`;
}
