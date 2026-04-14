import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletsApi } from '../api/wallets.api';
import type { WalletPayload, WalletView } from '../types/wallets.types';

const walletsKey = ['wallets'] as const;

export function useWallets(includeArchived = false) {
  return useQuery({
    queryKey: [...walletsKey, includeArchived],
    queryFn: async () => (await walletsApi.list(includeArchived)).data,
  });
}

export function useWallet(id?: string) {
  return useQuery({
    queryKey: [...walletsKey, id],
    queryFn: async () => (await walletsApi.getById(id!)).data,
    enabled: Boolean(id),
  });
}

export function useSaveWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: WalletPayload }) => (await walletsApi.save(payload, id)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletsKey });
    },
  });
}

export function useArchiveWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wallet: WalletView) => {
      await walletsApi.archive(wallet);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletsKey });
    },
  });
}
