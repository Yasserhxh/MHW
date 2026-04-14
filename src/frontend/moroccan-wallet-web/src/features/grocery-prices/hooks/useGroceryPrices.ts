import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groceryPricesApi } from '../api/grocery-prices.api';
import type { AddPriceRequest, GroceryFilters } from '../types/grocery-prices.types';

const baseKey = ['grocery-prices'] as const;
const listKey = (filters: GroceryFilters) => [...baseKey, 'products', filters] as const;
const detailKey = (id?: string) => [...baseKey, 'product', id] as const;

export function useGroceryPrices(filters: GroceryFilters = {}) {
  return useQuery({
    queryKey: listKey(filters),
    queryFn: async () => (await groceryPricesApi.list(filters)).data,
  });
}

export function useGroceryPrice(id?: string) {
  return useQuery({
    queryKey: detailKey(id),
    queryFn: async () => (await groceryPricesApi.getById(id!)).data,
    enabled: Boolean(id),
  });
}

export function useSaveGroceryPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payload }: { payload: AddPriceRequest }) => (await groceryPricesApi.save(payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: baseKey });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useToggleFavoriteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, isFavorite }: { productId: string; isFavorite: boolean }) =>
      (await groceryPricesApi.toggleFavorite(productId, isFavorite)).data,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: baseKey });
      await queryClient.invalidateQueries({ queryKey: detailKey(variables.productId) });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
