import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../api/expenses.api';
import type { CreateExpenseRequest } from '../types/expenses.types';

export const expensesQueryKey = ['expenses', 'snapshot'] as const;

export function useExpensesSnapshot() {
  return useQuery({
    queryKey: expensesQueryKey,
    queryFn: async () => {
      const { data } = await expensesApi.getSnapshot();
      return data;
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExpenseRequest) => {
      const { data } = await expensesApi.create(payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesQueryKey });
    },
  });
}

export function useExpense(id?: string) {
  return useQuery({
    queryKey: ['expenses', 'detail', id],
    queryFn: async () => {
      const { data } = await expensesApi.getById(id!);
      return data;
    },
    enabled: Boolean(id),
  });
}
