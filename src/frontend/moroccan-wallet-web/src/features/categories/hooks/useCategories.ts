import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories.api';
import type { CategoryPayload } from '../types/categories.types';

const categoriesKey = ['categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: categoriesKey,
    queryFn: async () => (await categoriesApi.list()).data,
  });
}

export function useSaveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: CategoryPayload }) => (await categoriesApi.save(payload, id)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesKey }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await categoriesApi.remove(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesKey }),
  });
}
