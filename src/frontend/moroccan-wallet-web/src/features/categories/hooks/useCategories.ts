import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, type CategoryPayload } from '../api/categories.api';

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
