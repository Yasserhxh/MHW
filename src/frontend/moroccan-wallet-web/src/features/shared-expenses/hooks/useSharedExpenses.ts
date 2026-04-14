import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sharedExpensesApi } from '../api/shared-expenses.api';

const groupsKey = ['shared-expense-groups'] as const;
const groupOverviewKey = (groupId?: string) => ['shared-expense-groups', groupId, 'overview'] as const;
const expenseDetailKey = (id?: string) => ['shared-expenses', id] as const;

export function useSharedGroups() {
  return useQuery({
    queryKey: groupsKey,
    queryFn: async () => (await sharedExpensesApi.listGroups()).data,
  });
}

export function useSharedGroupOverview(groupId?: string) {
  return useQuery({
    queryKey: groupOverviewKey(groupId),
    queryFn: async () => (await sharedExpensesApi.getGroupOverview(groupId!)).data,
    enabled: Boolean(groupId),
  });
}

export function useSharedExpense(id?: string) {
  return useQuery({
    queryKey: expenseDetailKey(id),
    queryFn: async () => (await sharedExpensesApi.getDetail(id!)).data,
    enabled: Boolean(id),
  });
}

export function useCreateSharedGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Parameters<typeof sharedExpensesApi.createGroup>[0]) =>
      (await sharedExpensesApi.createGroup(payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: groupsKey });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAddSharedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Parameters<typeof sharedExpensesApi.addExpense>[0]) =>
      (await sharedExpensesApi.addExpense(payload)).data,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: groupOverviewKey(variables.groupId) });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCreateSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Parameters<typeof sharedExpensesApi.createSettlement>[0]) =>
      (await sharedExpensesApi.createSettlement(payload)).data,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: groupOverviewKey(variables.groupId) });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
    },
  });
}
