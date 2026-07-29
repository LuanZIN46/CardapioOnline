import { useQuery } from '@tanstack/react-query';
import {
  fetchAddonGroups,
  fetchCategories,
  fetchProducts,
  fetchSettings,
} from '@/services/catalog.service';
import { storeSettings } from '@/data/settings';

const FIVE_MINUTES = 1000 * 60 * 5;

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: FIVE_MINUTES,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: FIVE_MINUTES,
  });
}

export function useAddonGroups() {
  return useQuery({
    queryKey: ['addon-groups'],
    queryFn: fetchAddonGroups,
    staleTime: FIVE_MINUTES,
  });
}

export function useStoreSettings() {
  const query = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: FIVE_MINUTES,
  });

  return { ...query, settings: query.data ?? storeSettings };
}
