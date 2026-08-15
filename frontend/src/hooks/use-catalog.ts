import { useQuery } from '@tanstack/react-query';
import { fetchCardapio, mesclarConfiguracoes } from '@/services/catalog.service';
import { storeSettings } from '@/data/settings';
import type { AddonGroup, Category, Product } from '@/types';

const CINCO_MINUTOS = 1000 * 60 * 5;

const VAZIO = {
  categories: [] as Category[],
  products: [] as Product[],
  addonGroups: [] as AddonGroup[],
};

/**
 * Uma única consulta traz categorias, produtos e adicionais.
 * Os hooks abaixo apenas recortam esse resultado, então todos compartilham o
 * mesmo cache e os mesmos estados de carregamento e erro.
 */
export function useCardapio() {
  return useQuery({
    queryKey: ['cardapio'],
    queryFn: fetchCardapio,
    staleTime: CINCO_MINUTOS,
    retry: 1,
  });
}

export function useCategories() {
  const query = useCardapio();
  return { ...query, data: query.data?.categories ?? VAZIO.categories };
}

export function useProducts() {
  const query = useCardapio();
  return { ...query, data: query.data?.products ?? VAZIO.products };
}

export function useAddonGroups() {
  const query = useCardapio();
  return { ...query, data: query.data?.addonGroups ?? VAZIO.addonGroups };
}

/**
 * Dados do estabelecimento. Nome, endereço e horários ainda são locais;
 * a taxa de entrega vem do banco, que é quem manda no cálculo do pedido.
 */
export function useStoreSettings() {
  const query = useCardapio();

  return {
    ...query,
    settings:
      query.data === undefined ? storeSettings : mesclarConfiguracoes(query.data.deliveryFee),
  };
}
