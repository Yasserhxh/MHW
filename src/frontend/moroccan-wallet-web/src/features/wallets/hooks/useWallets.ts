import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletsApi } from '../api/wallets.api';
import type { WalletPayload } from '../types/wallets.types';

const walletsKey = ['wallets'] as const;

export function useWallets() {
  return useQuery({
    queryKey: walletsKey,
    queryFn: async () => (await walletsApi.list()).data,
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
