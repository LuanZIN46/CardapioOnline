import { api, rotaPublica } from './api';
import type { CartItem, DeliveryAddress, OrderPayment, OrderType, PaymentMethod } from '@/types';

/**
 * Envio do pedido para a API.
 *
 * O frontend manda apenas identificadores e quantidades: o servidor recalcula
 * preços, subtotal, taxa e total a partir do banco. A resposta é a fonte da
 * verdade usada para montar a comanda.
 */

type TipoApi = 'ENTREGA' | 'RETIRADA';
type PagamentoApi = 'PIX' | 'CARTAO' | 'DINHEIRO';

const TIPO: Record<OrderType, TipoApi> = {
  delivery: 'ENTREGA',
  pickup: 'RETIRADA',
};

const PAGAMENTO: Record<PaymentMethod, PagamentoApi> = {
  pix: 'PIX',
  card: 'CARTAO',
  cash: 'DINHEIRO',
};

export interface EnvioPedido {
  cliente: string;
  telefone: string;
  tipo: OrderType;
  endereco?: DeliveryAddress;
  pagamento: OrderPayment;
  observacao?: string;
  itens: CartItem[];
}

/** Pedido como o servidor devolveu — todos os valores já calculados por ele. */
export interface PedidoSalvo {
  id: string;
  numero: number;
  cliente: string;
  telefone: string;
  tipo: TipoApi;
  endereco: string | null;
  formaPagamento: PagamentoApi;
  trocoPara: number | null;
  status: string;
  observacao: string | null;
  subtotal: number;
  taxaEntrega: number;
  valorTotal: number;
  createdAt: string;
  itens: Array<{
    id: string;
    nome: string;
    preco: number;
    quantidade: number;
    subtotal: number;
    observacao: string | null;
    adicionais: Array<{ id: string; nome: string; preco: number; quantidade: number }>;
  }>;
}

export async function enviarPedido(envio: EnvioPedido): Promise<PedidoSalvo> {
  const corpo = {
    cliente: envio.cliente,
    telefone: envio.telefone,
    tipo: TIPO[envio.tipo],
    ...(envio.tipo === 'delivery' && envio.endereco
      ? {
          endereco: {
            rua: envio.endereco.street,
            numero: envio.endereco.number,
            bairro: envio.endereco.neighborhood,
            cidade: envio.endereco.city,
          },
        }
      : {}),
    formaPagamento: PAGAMENTO[envio.pagamento.method],
    ...(envio.pagamento.method === 'cash' && envio.pagamento.changeFor
      ? { trocoPara: envio.pagamento.changeFor }
      : {}),
    ...(envio.observacao ? { observacao: envio.observacao } : {}),
    itens: envio.itens.map((item) => ({
      produtoId: item.productId,
      quantidade: item.quantity,
      ...(item.notes ? { observacao: item.notes } : {}),
      ...(item.addons.length > 0
        ? {
            adicionais: item.addons.map((addon) => ({
              adicionalId: addon.addonId,
              quantidade: addon.quantity,
            })),
          }
        : {}),
    })),
  };

  const { data } = await api.post<PedidoSalvo>(rotaPublica('/pedidos'), corpo);
  return data;
}
