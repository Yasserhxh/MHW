import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/types/api';
import type { WalletPayload, WalletView } from '../types/wallets.types';

type WalletDto = {
  id: string;
  name: string;
  type: string;
  currency: string;
  currentBalance: number;
  color?: string | null;
  icon?: string | null;
  isArchived: boolean;
};

type TransactionDto = {
  id: string;
  walletId?: string | null;
};

function normalizeWalletType(type: string): WalletPayload['type'] {
  const value = type.toLowerCase();
  if (value === 'sharedhousehold' || value === 'shared-household') {
    return 'shared-household';
  }
  if (value === 'cash' || value === 'bank' || value === 'savings') {
    return value;
  }
  return 'bank';
}

function toWalletView(wallet: WalletDto, transactionCount: number): WalletView {
  return {
    id: wallet.id,
    name: wallet.name,
    type: normalizeWalletType(wallet.type),
    currency: wallet.currency,
    balance: wallet.currentBalance,
    color: wallet.color ?? 'teal',
    icon: wallet.icon ?? 'wallet',
    transactionCount,
    isArchived: wallet.isArchived,
  };
}

async function getTransactionCounts() {
  const { data } = await apiClient.get<PagedResult<TransactionDto>>('/transactions', {
    params: { page: 1, pageSize: 100 },
  });

  return data.items.reduce<Record<string, number>>((acc, item) => {
    if (item.walletId) {
      acc[item.walletId] = (acc[item.walletId] ?? 0) + 1;
    }
    return acc;
  }, {});
}

export const walletsApi = {
  list: async (includeArchived = false) => {
    const [walletsResponse, counts] = await Promise.all([
      apiClient.get<WalletDto[]>('/wallets', { params: { includeArchived } }),
      getTransactionCounts(),
    ]);

    return {
      data: walletsResponse.data.map((wallet) => toWalletView(wallet, counts[wallet.id] ?? 0)),
    };
  },

  getById: async (id: string) => {
    const [walletResponse, counts] = await Promise.all([
      apiClient.get<WalletDto>(`/wallets/${id}`),
      getTransactionCounts(),
    ]);

    return {
      data: toWalletView(walletResponse.data, counts[id] ?? 0),
    };
  },

  save: async (payload: WalletPayload, id?: string) => {
    const request = {
      name: payload.name,
      type: payload.type === 'shared-household' ? 'sharedHousehold' : payload.type,
      currency: payload.currency,
      currentBalance: payload.balance,
      color: payload.color,
      icon: payload.icon,
      ...(id ? { isArchived: false } : {}),
    };

    if (id) {
      await apiClient.put(`/wallets/${id}`, request);
      return walletsApi.getById(id);
    }

    const { data } = await apiClient.post<{ id: string }>('/wallets', request);
    return walletsApi.getById(data.id);
  },

  archive: async (wallet: WalletView) => {
    await apiClient.put(`/wallets/${wallet.id}`, {
      name: wallet.name,
      type: wallet.type === 'shared-household' ? 'sharedHousehold' : wallet.type,
      currency: wallet.currency,
      currentBalance: wallet.balance,
      color: wallet.color,
      icon: wallet.icon,
      isArchived: true,
    });
  },
};
