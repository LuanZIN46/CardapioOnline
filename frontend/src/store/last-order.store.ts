import { create } from 'zustand';
import { revokeOrderPdf, type GeneratedOrderPdf, type OrderDocument } from '@/services/pdf/orderPdf.service';

/**
 * Guarda o último pedido finalizado e seu PDF.
 * Não é persistido: o Blob só vive nesta aba, e o carrinho já foi limpo.
 */
interface LastOrderState {
  order?: OrderDocument;
  pdf?: GeneratedOrderPdf;
  definir: (order: OrderDocument, pdf: GeneratedOrderPdf) => void;
  limpar: () => void;
}

export const useLastOrderStore = create<LastOrderState>()((set, get) => ({
  order: undefined,
  pdf: undefined,

  definir: (order, pdf) => {
    // Libera o Blob anterior antes de trocar, senão a URL fica vazando memória.
    const anterior = get().pdf;
    if (anterior) revokeOrderPdf(anterior);
    set({ order, pdf });
  },

  limpar: () => {
    const anterior = get().pdf;
    if (anterior) revokeOrderPdf(anterior);
    set({ order: undefined, pdf: undefined });
  },
}));
