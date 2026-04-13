import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groceryPricesApi } from '../api/grocery-prices.api';
import type { AddPriceRequest } from '../types/grocery-prices.types';

const key = ['grocery-prices'] as const;

export function useGroceryPrices() {
  return useQuery({ queryKey: key, queryFn: async () => (await groceryPricesApi.list()).data });
}

export function useGroceryPrice(id?: string) {
  return useQuery({ queryKey: [...key, id], queryFn: async () => (await groceryPricesApi.getById(id!)).data, enabled: Boolean(id) });
}

export function useSaveGroceryPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ payload }: { id?: string; payload: AddPriceRequest }) => (await groceryPricesApi.save(payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
