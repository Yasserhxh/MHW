import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../api/expenses.api';
import type { CreateExpenseRequest, ExpenseFilters, UpdateExpenseRequest } from '../types/expenses.types';

export const expensesQueryKey = ['expenses'] as const;

export function useExpensesSnapshot(filters: ExpenseFilters) {
  return useQuery({
    queryKey: [...expensesQueryKey, 'snapshot', filters],
    queryFn: async () => {
      const { data } = await expensesApi.getSnapshot(filters);
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

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateExpenseRequest) => {
      await expensesApi.update(payload);
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: expensesQueryKey });
      queryClient.invalidateQueries({ queryKey: [...expensesQueryKey, 'detail', payload.id] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await expensesApi.remove(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: expensesQueryKey });
      queryClient.removeQueries({ queryKey: [...expensesQueryKey, 'detail', id] });
    },
  });
}

export function useExpense(id?: string) {
  return useQuery({
    queryKey: [...expensesQueryKey, 'detail', id],
    queryFn: async () => {
      const { data } = await expensesApi.getById(id!);
      return data;
    },
    enabled: Boolean(id),
  });
}
