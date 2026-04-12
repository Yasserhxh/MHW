import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sharedExpensesApi } from '../api/shared-expenses.api';

const key = ['shared-expenses'] as const;

export function useSharedExpensesOverview() {
  return useQuery({ queryKey: key, queryFn: async () => (await sharedExpensesApi.getOverview()).data });
}

export function useSharedExpense(id?: string) {
  return useQuery({ queryKey: [...key, id], queryFn: async () => (await sharedExpensesApi.getDetail(id!)).data, enabled: Boolean(id) });
}

export function useAddSharedExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof sharedExpensesApi.addExpense>[0]) => (await sharedExpensesApi.addExpense(payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
